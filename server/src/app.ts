import path from 'node:path';
import fs from 'node:fs';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { installAsyncErrorHandling } from './lib/asyncHandler.js';

import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { securityHeaders, corsPolicy } from './middleware/security.js';
import { globalLimiter, slowDownMiddleware } from './middleware/rateLimit.js';
import { csrfProtection, issueCsrfToken } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

import contentRoutes from './modules/content/content.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import leadsRoutes from './modules/leads/leads.routes.js';
import newsletterRoutes from './modules/newsletter/newsletter.routes.js';
import appointmentRoutes from './modules/appointments/appointments.routes.js';
import budgetRoutes from './modules/budget/budget.routes.js';
import uploadRoutes from './modules/uploads/uploads.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import adminContentRoutes from './modules/admin/content.admin.routes.js';

import { renderPage } from './ssr/render.js';
import { buildSitemap } from './seo/sitemap.js';

// Express 4 ne rattache pas les rejets des handlers `async` au middleware
// d'erreurs : on installe la prise en charge une fois, avant tout montage.
installAsyncErrorHandling();

export function createApp(): Express {
  const app = express();

  /* ─────────────────────────────── Base ──────────────────────────────── */

  app.set('trust proxy', env.TRUST_PROXY ? 1 : false);
  app.disable('x-powered-by');
  app.set('etag', 'strong');

  app.use(pinoHttp({ logger }));
  app.use(securityHeaders);
  app.use(corsPolicy);
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());

  /* ──────────────────────────────── API ──────────────────────────────── */

  app.use('/api', globalLimiter, slowDownMiddleware);

  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        ok: true,
        data: {
          status: 'healthy',
          database: 'up',
          uptime: Math.round(process.uptime()),
          version: process.env.npm_package_version ?? '1.0.0',
          environment: env.NODE_ENV,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      res.status(503).json({
        ok: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Base de données injoignable' },
      });
    }
  });

  /** Émission du jeton CSRF (double submit cookie). */
  app.get('/api/csrf', (_req: Request, res: Response) => {
    const token = issueCsrfToken(res);
    res.json({ ok: true, data: { token } });
  });

  app.use('/api', csrfProtection);

  app.use('/api', contentRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/leads', leadsRoutes);
  app.use('/api/newsletter', newsletterRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/budget', budgetRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin/content', adminContentRoutes);

  /* ─────────────────────────── Fichiers statiques ─────────────────────── */

  // Médias publiés par le cabinet (visuels de projets, plans).
  app.use(
    '/uploads',
    express.static(env.storageDir, {
      maxAge: env.isProd ? '30d' : 0,
      index: false,
      dotfiles: 'deny',
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    }),
  );

  // Rendu client compilé (assets Vite, favicon, manifest).
  if (fs.existsSync(env.clientDist)) {
    app.use(
      express.static(env.clientDist, {
        index: false,
        maxAge: env.isProd ? '1y' : 0,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        },
      }),
    );
  }

  /* ───────────────────────── Pages pré-rendues (prerender) ────────────── */

  /**
   * Le pré-rendu écrit un fichier `prerendered/<route>/index.html` par route.
   * Sans ce montage, ces fichiers n'étaient joignables que par leur chemin
   * technique (`/prerendered/...`) et jamais à l'URL publique attendue.
   */
  const prerenderDir = path.join(env.clientDist, 'prerendered');
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/assets/')) return next();
    const relative = req.path.replace(/^\/+/, '');
    if (!relative || relative.includes('..')) return next();
    const candidate = path.join(prerenderDir, relative, 'index.html');
    if (!candidate.startsWith(prerenderDir + path.sep) || !fs.existsSync(candidate)) return next();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    res.setHeader('X-Prerendered', 'hit');
    res.sendFile(candidate);
  });

  /* ────────────────────────────── SEO ────────────────────────────────── */

  app.get('/robots.txt', (_req: Request, res: Response) => {
    const base = env.APP_URL.replace(/\/$/, '');
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        '',
        `Sitemap: ${base}/sitemap.xml`,
        '',
      ].join('\n'),
    );
  });

  app.get('/sitemap.xml', async (_req: Request, res: Response) => {
    try {
      const xml = await buildSitemap();
      res.type('application/xml').send(xml);
    } catch (error) {
      logger.error({ err: error }, 'Génération du sitemap impossible');
      res.status(500).type('text/plain').send('Sitemap indisponible');
    }
  });

  /* ─────────────────────── Rendu des pages (SSR) ─────────────────────── */

  app.get('*', async (req: Request, res: Response, next: NextFunction) => {
    // Toute route "/api" (y compris "/api" sans barre oblique) relève de l'API :
    // elle doit répondre en JSON, pas avec la page HTML de l'application.
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    try {
      const result = await renderPage(`${env.APP_URL}${req.originalUrl}`);
      res.status(result.status);
      for (const [key, value] of Object.entries(result.headers)) res.setHeader(key, value);
      if (!res.hasHeader('Content-Type')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
      // Le HTML référence des assets dont le nom change à chaque build :
      // il ne doit jamais être réutilisé depuis le cache du navigateur, sous
      // peine de pointer vers une feuille de style supprimée (page sans style).
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
      res.send(result.html);
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, 'Rendu SSR impossible');
      next(error);
    }
  });

  /* ──────────────────────────── Erreurs ──────────────────────────────── */

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function resolveStaticPath(...segments: string[]): string {
  return path.join(env.repoRoot, ...segments);
}
