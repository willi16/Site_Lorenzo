import type { RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

/**
 * En-têtes de sécurité HTTP (Helmet) avec une CSP stricte mais compatible avec
 * les intégrations prévues : Google Maps, Google Analytics 4, Tag Manager, Hotjar.
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://www.googletagservices.com',
        'https://script.hotjar.com',
        'https://maps.googleapis.com',
        'https://maps.gstatic.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://maps.googleapis.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      mediaSrc: ["'self'", 'blob:', 'https:'],
      connectSrc: [
        "'self'",
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://region1.google-analytics.com',
        'https://script.hotjar.com',
        'https://maps.googleapis.com',
        'https://maps.gstatic.com',
      ],
      frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com', 'https://my.matterport.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: env.isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: env.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
});

/**
 * Helmet v8 ne gère plus Permissions-Policy : on l'ajoute explicitement pour
 * désactiver les capteurs et API sensibles dont le site n'a pas besoin.
 */
export const securityHeaders: RequestHandler = (req, res, next) => {
  helmetMiddleware(req, res, (error?: unknown) => {
    if (error) {
      next(error);
      return;
    }
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
    );
    next();
  });
};

/**
 * CORS : liste blanche stricte. Les requêtes sans Origin (SSR, curl, health-check)
 * sont acceptées ; les navigateurs cross-origin non autorisés sont rejetés.
 *
 * Le rejet renvoie une erreur applicative 403 : une `Error` brute aurait été
 * traduite en 500 par le gestionnaire d'erreurs, masquant la vraie cause.
 */
export const corsPolicy: RequestHandler = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);
    // En développement, accepter le serveur Vite quelle que soit la façon dont
    // l'hôte est résolu (localhost, 127.0.0.1 ou [::1]) : le navigateur peut
    // émettre l'un ou l'autre selon l'URL saisie.
    if (env.isDev && /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'Origine non autorisée par la politique CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['RateLimit', 'RateLimit-Policy'],
  maxAge: 86_400,
});
