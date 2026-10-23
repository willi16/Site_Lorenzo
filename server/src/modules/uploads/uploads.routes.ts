import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { upload, privateUpload, toMediaPayload } from '../../middleware/upload.js';
import { formLimiter } from '../../middleware/rateLimit.js';
import { env } from '../../config/env.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * Téléversement public de pièces jointes pour une demande de devis.
 * Les fichiers sont rangés hors du dossier public et rattachés à une entrée
 * Media sans URL publique : seuls les administrateurs peuvent les récupérer.
 */
router.post('/lead', formLimiter, privateUpload.array('files', 6), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw badRequest('Aucun fichier reçu');

  const created = [];
  for (const file of files) {
    const media = await prisma.media.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        url: null,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
    created.push({ id: media.id, originalName: media.originalName, size: media.size });
  }

  logger.info({ count: created.length, ip: req.ip }, 'Pièces jointes de lead reçues');
  res.status(201).json({ ok: true, data: created.map((m) => m.id) });
});

/** Récupération d'une pièce jointe : réservée aux comptes authentifiés. */
router.get('/file/:id', requireAuth, requireRole('ADMIN', 'EDITOR'), async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) throw notFound('Fichier introuvable');
  const filePath = path.join(env.privateDir, path.basename(media.filename));
  if (!fs.existsSync(filePath)) throw notFound('Fichier introuvable');
  res.setHeader('Content-Type', media.mimeType ?? 'application/octet-stream');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(media.originalName ?? media.filename)}"`,
  );
  fs.createReadStream(filePath).pipe(res);
});

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  upload.array('files', 6),
  validate({
    body: z.object({
      alt: z.string().max(200).optional().default(''),
    }),
  }),
  async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) throw badRequest('Aucun fichier reçu');

    const alt = (req.body as { alt?: string }).alt ?? '';
    const created = [];
    for (const file of files) {
      const payload = toMediaPayload(file);
      const media = await prisma.media.create({
        data: { ...payload, alt: alt || file.originalname, uploadedById: req.user!.id },
      });
      created.push(media);
    }
    logger.info({ count: created.length, userId: req.user!.id }, 'Médias téléversés');
    res.status(201).json({ ok: true, data: created });
  },
);

router.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  async (_req, res) => {
    const items = await prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    res.json({ ok: true, data: items });
  },
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate({ params: z.object({ id: z.string().min(1) }) }),
  async (req, res) => {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) throw notFound('Média introuvable');
    // Les pièces jointes de leads vivent dans `privateDir`, les médias publiés
    // dans `storageDir`. Ne regarder que le second provoquait un ENOENT
    // silencieux : la ligne partait mais le fichier restait sur le disque.
    const fileName = path.basename(media.filename);
    for (const dir of [env.storageDir, env.privateDir]) {
      try {
        await fs.promises.unlink(path.join(dir, fileName));
        break;
      } catch {
        // Fichier absent dans ce répertoire : on tente le suivant.
      }
    }
    await prisma.media.delete({ where: { id: media.id } });
    res.json({ ok: true, data: { message: 'Média supprimé' } });
  },
);

export default router;
