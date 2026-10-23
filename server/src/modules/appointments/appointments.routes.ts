import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { validate } from '../../middleware/validate.js';
import { formLimiter } from '../../middleware/rateLimit.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { sendMail } from '../../lib/email.js';
import { env } from '../../config/env.js';
import { badRequest, conflict } from '../../lib/errors.js';

const router = Router();

/** Créneaux de rendez-vous proposés (heure locale de Lomé, UTC+0). */
const SLOTS = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00'] as const;
const SLOT_MINUTES = 45;
const MAX_DAYS_AHEAD = 90;

/**
 * Convertit une date « AAAA-MM-JJ » en Date UTC.
 *
 * Le contrôle par expression régulière seul acceptait des dates inexistantes
 * (« 2026-02-30 » était ramenée au 2 mars, « 2026-13-45 » produisait un Date
 * invalide qui finissait en erreur 500 côté base). On vérifie donc que la date
 * existe réellement dans le calendrier.
 */
function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  // Rejet des dates « débordantes » (30 février, 31 avril…).
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }
  return date;
}

router.get('/slots', validate({ query: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }) }), async (req, res) => {
  const { date } = req.query as { date: string };
  const day = parseCalendarDate(date);
  if (!day) throw badRequest('Date invalide');

  const taken = await prisma.appointment.findMany({
    where: {
      date: { gte: day, lt: new Date(day.getTime() + 24 * 60 * 60 * 1000) },
      status: { not: 'CANCELLED' },
    },
    select: { slot: true },
  });
  const takenSlots = new Set(taken.map((t) => t.slot));
  res.json({ ok: true, data: { date, slots: SLOTS.filter((s) => !takenSlots.has(s)) } });
});

const appointmentSchema = z.object({
  name: z.string().trim().min(2, 'Nom requis').max(100),
  email: z.string().trim().email('Adresse e-mail invalide').max(160),
  phone: z.string().trim().min(6, 'Téléphone invalide').max(30),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
  slot: z.enum(SLOTS, { errorMap: () => ({ message: 'Créneau invalide' }) }),
  subject: z.string().trim().max(200).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
  website: z.string().max(0).optional().default(''),
});

/**
 * Échappe les textes saisis par le visiteur avant leur injection dans le HTML
 * de l'e-mail (injection de balisage dans la notification au cabinet).
 */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

router.post(
  '/',
  formLimiter,
  validate({ body: appointmentSchema }),
  async (req, res) => {
    const data = req.body as z.infer<typeof appointmentSchema>;
    if (data.website) {
      res.status(201).json({ ok: true, data: { id: 'accepted' } });
      return;
    }

    const day = parseCalendarDate(data.date);
    if (!day) throw badRequest('Date invalide');
    const now = new Date();
    if (day < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      throw badRequest('La date choisie est déjà passée');
    }
    if (day.getTime() > now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000) {
      throw badRequest(`Les rendez-vous ne sont ouverts que ${MAX_DAYS_AHEAD} jours à l’avance`);
    }
    // Pas de rendez-vous le dimanche (Lomé)
    if (day.getUTCDay() === 0) throw badRequest('Le cabinet est fermé le dimanche');

    // Transaction sérialisable : la vérification du créneau et l'insertion se
    // font dans le même instantané. Deux réservations simultanées du même
    // créneau ne peuvent donc pas aboutir toutes les deux.
    const appointment = await createAppointmentWithSlotCheck(data, day);

    await sendMail({
      to: env.MAIL_TO || 'contact@ba-construction.tg',
      subject: `Nouveau rendez-vous : ${data.name}`,
      html: `<p><strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)} / ${escapeHtml(
        data.phone,
      )}) souhaite un rendez-vous le
        <strong>${escapeHtml(data.date)}</strong> à <strong>${escapeHtml(data.slot)}</strong>.</p>
        <p>${escapeHtml(data.subject || '')}</p><p>${escapeHtml(data.notes || '')}</p>`,
    });

    res.status(201).json({
      ok: true,
      data: { id: appointment.id, message: 'Rendez-vous enregistré. Vous recevrez une confirmation.' },
    });
  },
);

/**
 * Réserve un créneau en sérialisant la vérification et l'insertion.
 *
 * En isolation « Read Committed » (défaut de PostgreSQL), deux requêtes
 * simultanées pouvaient toutes deux voir le créneau comme libre et créer deux
 * rendez-vous. Le niveau « Serializable » fait échouer l'une des deux ; on
 * réessaie alors que jusqu'à 3 fois.
 */
async function createAppointmentWithSlotCheck(
  data: z.infer<typeof appointmentSchema>,
  day: Date,
) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existing = await tx.appointment.findFirst({
            where: { date: day, slot: data.slot, status: { not: 'CANCELLED' } },
          });
          if (existing) throw conflict('Ce créneau vient d’être réservé. Choisissez-en un autre.');
          return tx.appointment.create({
            data: {
              name: data.name,
              email: data.email.toLowerCase(),
              phone: data.phone,
              date: day,
              slot: data.slot,
              duration: SLOT_MINUTES,
              subject: data.subject || null,
              notes: data.notes || null,
            },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      const isConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
      if (!isConflict || attempt === maxAttempts) throw error;
    }
  }
  throw conflict('Ce créneau vient d’être réservé. Choisissez-en un autre.');
}

router.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  async (_req, res) => {
    const items = await prisma.appointment.findMany({ orderBy: { date: 'asc' }, take: 200 });
    res.json({ ok: true, data: items });
  },
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']) }),
  }),
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' };
    const item = await prisma.appointment.update({ where: { id }, data: { status } });
    res.json({ ok: true, data: item });
  },
);

export default router;
