import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validate } from '../../middleware/validate.js';
import { formLimiter } from '../../middleware/rateLimit.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { emailTemplates, sendMail } from '../../lib/email.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { badRequest } from '../../lib/errors.js';

const router = Router();

const PROJECT_TYPES = [
  'Construction résidentielle',
  'Bâtiment commercial',
  'Rénovation et extension',
  'Aménagement intérieur',
  'Aménagement extérieur',
  'Suivi de chantier',
  'Conseil et expertise',
  'Autre',
] as const;

const leadSchema = z.object({
  firstName: z.string().trim().min(2, 'Prénom requis').max(80),
  lastName: z.string().trim().min(2, 'Nom requis').max(80),
  email: z.string().trim().email('Adresse e-mail invalide').max(160),
  phone: z
    .string()
    .trim()
    .min(6, 'Numéro de téléphone invalide')
    .max(30)
    .regex(/^[+\d][\d\s().-]{5,29}$/, 'Numéro de téléphone invalide'),
  projectType: z.enum(PROJECT_TYPES, { errorMap: () => ({ message: 'Type de projet invalide' }) }),
  area: z.string().trim().max(40).optional().default(''),
  budget: z.string().trim().max(60).optional().default(''),
  location: z.string().trim().min(2, 'Localisation requise').max(160),
  description: z.string().trim().min(20, 'Merci de décrire votre projet (20 caractères minimum)').max(4000),
  contactPreference: z.enum(['email', 'phone', 'whatsapp']).default('email'),
  attachments: z.array(z.string().max(300)).max(6).optional().default([]),
  website: z.string().max(200).optional().default(''), // honeypot : doit rester vide
});

/** Anti-spam : champ honeypot + délai minimum de soumission. */
const submittedAt = new Map<string, number>();
const MIN_SUBMIT_DELAY_MS = 2500;

/**
 * Ne conserve que les identifiants de pièces jointes qui existent en base et
 * n'ont pas encore d'URL publique (donc issues de `/api/leads` ou de
 * `/api/uploads/lead`). Les valeurs inconnues sont rejetées.
 */
async function resolveAttachmentIds(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const unique = [...new Set(ids)];
  const found = await prisma.media.findMany({
    where: { id: { in: unique }, url: null },
    select: { id: true },
  });
  if (found.length !== unique.length) {
    throw badRequest('Pièce jointe introuvable ou déjà utilisée.');
  }
  return unique;
}

router.post(
  '/',
  formLimiter,
  validate({ body: leadSchema }),
  async (req, res) => {
    const data = req.body as z.infer<typeof leadSchema>;

    if (data.website) {
      // Bot détecté : on répond 201 sans rien enregistrer.
      res.status(201).json({ ok: true, data: { id: 'accepted' } });
      return;
    }

    const key = `${req.ip}|${data.email}`;
    const last = submittedAt.get(key);
    if (last && Date.now() - last < MIN_SUBMIT_DELAY_MS) {
      res.status(201).json({ ok: true, data: { id: 'accepted' } });
      return;
    }
    submittedAt.set(key, Date.now());
    if (submittedAt.size > 5000) submittedAt.clear();

    // Les identifiants de pièces jointes sont fournis par le client : on vérifie
    // qu'ils correspondent à des médias privés réellement téléversés, sans quoi
    // n'importe qui pourrait rattacher des pièces d'un autre visiteur.
    const attachments = await resolveAttachmentIds(data.attachments);

    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        projectType: data.projectType,
        area: data.area || null,
        budget: data.budget || null,
        location: data.location,
        description: data.description,
        contactPreference: data.contactPreference,
        attachments,
      },
    });

    logger.info({ leadId: lead.id, type: lead.projectType }, 'Nouveau lead reçu');

    const tpl = emailTemplates.newLead({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      projectType: lead.projectType,
      location: lead.location,
      description: lead.description,
    });
    void sendMail({ to: env.MAIL_TO || 'contact@ba-construction.tg', subject: tpl.title, html: tpl.html });

    const conf = emailTemplates.leadConfirmation({
      firstName: lead.firstName,
      projectType: lead.projectType,
    });
    void sendMail({ to: lead.email, subject: conf.title, html: conf.html, replyTo: env.MAIL_TO || undefined });

    res.status(201).json({
      ok: true,
      data: { id: lead.id, message: 'Votre demande a bien été transmise à notre équipe.' },
    });
  },
);

/* ──────────────────────────── Espace administrateur ─────────────────────── */

const leadQuerySchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'QUALIFIED', 'WON', 'LOST']).optional(),
  q: z.string().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});

router.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ query: leadQuerySchema }),
  async (req, res) => {
    const q = req.query as unknown as z.infer<typeof leadQuerySchema>;
    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.q
        ? {
            OR: [
              { firstName: { contains: q.q, mode: 'insensitive' as const } },
              { lastName: { contains: q.q, mode: 'insensitive' as const } },
              { email: { contains: q.q, mode: 'insensitive' as const } },
              { location: { contains: q.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: q.offset, take: q.limit }),
      prisma.lead.count({ where }),
    ]);
    res.json({ ok: true, data: items, meta: { total } });
  },
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ status: z.enum(['NEW', 'IN_PROGRESS', 'QUALIFIED', 'WON', 'LOST']) }),
  }),
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status: 'NEW' | 'IN_PROGRESS' | 'QUALIFIED' | 'WON' | 'LOST' };
    const lead = await prisma.lead.update({ where: { id }, data: { status } });
    res.json({ ok: true, data: lead });
  },
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate({ params: z.object({ id: z.string().min(1) }) }),
  async (req, res) => {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: { message: 'Lead supprimé' } });
  },
);

export default router;
