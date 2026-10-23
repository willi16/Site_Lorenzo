import { Router } from 'express';
import type { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { computeEstimate, estimateSchema, FINISH_LEVELS, OPTIONS, TARIFFS } from './tariffs.js';

const router = Router();

router.get('/tariffs', (_req, res) => {
  res.json({
    ok: true,
    data: {
      tariffs: Object.entries(TARIFFS).map(([key, t]) => ({ key, ...t })),
      finishes: Object.entries(FINISH_LEVELS).map(([key, f]) => ({ key, ...f })),
      options: Object.entries(OPTIONS).map(([key, o]) => ({ key, ...o })),
    },
  });
});

router.post('/estimate', validate({ body: estimateSchema }), (req, res) => {
  const data = req.body as z.infer<typeof estimateSchema>;
  // Le schéma Zod garantit déjà que `projectType` appartient à l'énumération
  // des tarifs : plus besoin de revérifier ici.
  res.json({ ok: true, data: computeEstimate(data) });
});

export default router;
