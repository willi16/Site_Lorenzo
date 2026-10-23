import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import type { Request } from 'express';
import { env } from '../config/env.js';

const jsonMessage = (message: string) => ({ ok: false, error: { code: 'TOO_MANY_REQUESTS', message } });

/**
 * Clé de regroupement des requêtes par client.
 *
 * Les adresses IPv6 sont normalisées sur leur préfixe /64 : un particulier
 * derrière un accès IPv6 dynamique ne doit pas pouvoir contourner les limites
 * en changeant d'adresse à chaque requête.
 */
export function clientKey(req: Request): string {
  const raw = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const ip = raw.startsWith('::ffff:') ? raw.slice(7) : raw;
  if (!ip.includes(':')) return ip;
  return ip.split(':').slice(0, 4).join(':') || 'unknown';
}

/** Limiteur global : protège l'API des abus sans gêner la navigation normale. */
export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientKey,
  handler: (_req, res) => {
    res.status(429).json(jsonMessage('Trop de requêtes. Veuillez réessayer dans quelques instants.'));
  },
});

/** Limiteur renforcé pour les routes sensibles (authentification). */
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: clientKey,
  handler: (_req, res) => {
    res
      .status(429)
      .json(jsonMessage('Trop de tentatives. Réessayez dans quelques minutes.'));
  },
});

/** Limiteur pour la soumission de formulaires publics (contact, devis, newsletter). */
export const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientKey,
  handler: (_req, res) => {
    res.status(429).json(
      jsonMessage('Trop de demandes envoyées. Écrivez-nous directement par téléphone ou e-mail.'),
    );
  },
});

/**
 * Ralentissement progressif : protège contre les attaques « low and slow »
 * (petites requêtes régulières qui échappent aux limites dures).
 *
 * `slowDown` renvoie déjà un handler express-rate-limit : on l'utilise
 * directement. L'envelopper dans un RequestHandler synchrone détachait le
 * `next()` asynchrone de la chaîne Express, si bien que les erreurs levées par
 * les handlers en aval (AppError) n'étaient plus interceptées par le
 * gestionnaire d'erreurs (promesses rejetées non gérées).
 */
export const slowDownMiddleware = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 60,
  // express-slow-down attend une fonction de calcul du délai.
  delayMs: () => 500,
  maxDelayMs: 10_000,
  keyGenerator: clientKey,
});
