import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { validate } from '../../middleware/validate.js';
import { formLimiter } from '../../middleware/rateLimit.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { generateSecureToken } from '../../lib/password.js';
import { emailTemplates, sendMail } from '../../lib/email.js';
import { logger } from '../../lib/logger.js';
import { badRequest } from '../../lib/errors.js';

const router = Router();

const subscribeSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide').max(160),
  name: z.string().trim().max(80).optional().default(''),
  source: z.string().max(40).optional().default('website'),
  website: z.string().max(0).optional().default(''),
});

router.post(
  '/',
  formLimiter,
  validate({ body: subscribeSchema }),
  async (req, res) => {
    const data = req.body as z.infer<typeof subscribeSchema>;
    if (data.website) {
      res.status(201).json({ ok: true, data: { subscribed: true } });
      return;
    }

    const email = data.email.toLowerCase();
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing?.status === 'ACTIVE') {
      res.json({ ok: true, data: { subscribed: true, message: 'Vous êtes déjà inscrit.' } });
      return;
    }

    const confirmToken = generateSecureToken(32);
    const unsubscribeToken = generateSecureToken(32);

    if (existing) {
      // Réactivation : on régénère les deux jetons.
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          status: 'PENDING',
          confirmToken,
          unsubscribeToken,
          name: data.name || existing.name,
          unsubscribedAt: null,
        },
      });
    } else {
      try {
        await prisma.newsletterSubscriber.create({
          data: {
            email,
            name: data.name || null,
            source: data.source,
            confirmToken,
            unsubscribeToken,
            status: 'PENDING',
          },
        });
      } catch (error) {
        // Deux inscriptions simultanées pour la même adresse : la contrainte
        // d'unicité rejette la seconde. C'est une course légitime, pas une
        // erreur métier : on ne renvoie pas de 409 au visiteur.
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
          throw error;
        }
      }
    }

    await sendConfirmation(email, confirmToken, unsubscribeToken, data.name);
    res.json({
      ok: true,
      data: { subscribed: true, message: 'Confirmation requise — consultez votre boîte e-mail.' },
    });
  },
);

async function sendConfirmation(
  email: string,
  confirmToken: string,
  unsubscribeToken: string,
  name?: string,
) {
  const link = `${env.APP_URL}/newsletter/confirmer?token=${confirmToken}`;
  const unsubscribeLink = `${env.APP_URL}/newsletter/desinscription?token=${unsubscribeToken}`;
  const tpl = emailTemplates.newsletterWelcome(name, unsubscribeLink);
  await sendMail({
    to: email,
    subject: tpl.title,
    html: tpl.html.replace(
      '</table>',
      `<p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#e76836;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">Confirmer mon inscription</a></p>
       <p style="margin:12px 0 0;font-size:12px;color:#6b7280">Si le bouton ne fonctionne pas, copiez ce lien : ${link}</p></table>`,
    ),
  });
}

router.get(
  '/confirm',
  validate({ query: z.object({ token: z.string().min(10).max(200) }) }),
  async (req, res) => {
    const { token } = req.query as { token: string };
    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } });
    if (!subscriber) {
      // 400 explicite : un « 200 » avec `{ ok: false } » faisait passer le lien
      // pour valide pour les clients qui testent uniquement `res.ok`.
      throw badRequest('Lien de confirmation invalide ou déjà utilisé.');
    }
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        subscribedAt: new Date(),
        confirmToken: generateSecureToken(32),
      },
    });
    logger.info({ email: subscriber.email }, 'Abonnement newsletter confirmé');
    res.json({ ok: true, data: { message: 'Votre inscription est confirmée. Bienvenue !' } });
  },
);

/**
 * Désinscription via le jeton dédié `unsubscribeToken`.
 *
 * Le jeton de confirmation ne peut pas servir ici : il est révoqué dès que
 * l'abonné valide son inscription, ce qui rendait le lien de désinscription
 * définitivement inopérant.
 */
router.get(
  '/unsubscribe',
  validate({ query: z.object({ token: z.string().min(10).max(200) }) }),
  async (req, res) => {
    const { token } = req.query as { token: string };
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });
    if (!subscriber) throw badRequest('Lien de désinscription invalide ou déjà utilisé.');
    if (subscriber.status !== 'UNSUBSCRIBED') {
      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
      });
      logger.info({ email: subscriber.email }, 'Abonné désinscrit de la newsletter');
    }
    res.json({ ok: true, data: { message: 'Vous avez été désinscrit de notre lettre.' } });
  },
);

router.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  async (_req, res) => {
    const [items, total, active] = await Promise.all([
      prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
    ]);
    res.json({ ok: true, data: items, meta: { total, active } });
  },
);

export default router;
