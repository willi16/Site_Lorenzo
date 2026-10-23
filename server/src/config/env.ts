import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(serverRoot, '..');

loadEnv({ path: path.join(repoRoot, '.env') });
loadEnv({ path: path.join(serverRoot, '.env') });

/**
 * Render expose automatiquement l'URL publique du service via
 * `RENDER_EXTERNAL_URL`. On s'en sert comme valeur par défaut pour `APP_URL`,
 * `API_URL` et `CORS_ORIGINS` : sans cela, un premier déploiement échouerait
 * (APP_URL en http) ou rejetterait les requêtes same-origin (Origin absent de
 * la liste blanche CORS). Une variable explicitement définie reste prioritaire.
 */
const renderBaseUrl = (() => {
  const value = process.env.RENDER_EXTERNAL_URL?.trim().replace(/\/+$/, '');
  return value && /^https?:\/\//.test(value) ? value : undefined;
})();

const LOCAL_URL_PATTERN = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

/**
 * Sur Render, une valeur locale (issue d'un `.env` copié par erreur ou d'un
 * ancien réglage) ne doit pas prendre le pas sur l'URL publique du service.
 */
function preferRenderUrl(value: string): string {
  return renderBaseUrl && LOCAL_URL_PATTERN.test(value) ? renderBaseUrl : value;
}

/**
 * Interprète une variable d'environnement comme un booléen.
 *
 * `z.coerce.boolean()` applique la règle de JavaScript `Boolean(v)` : la chaîne
 * "false" y devient `true`. Une variable comme `TRUST_PROXY=false` se
 * retrouvait donc activée, ce qui faisait confiance au proxy et rendait
 * `req.ip` falsifiable via `X-Forwarded-For` (contournement des quotas).
 */
function booleanFromEnv(defaultValue: boolean) {
  return z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined || value.trim() === '') return defaultValue;
      const normalized = value.trim().toLowerCase();
      if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
      if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
      return defaultValue;
    });
}

/**
 * Schéma de validation de l'environnement.
 * L'application refuse de démarrer si une variable critique est absente ou incohérente
 * (fail-fast) : c'est la première barrière contre les déploiements mal configurés.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().default('0.0.0.0'),

    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL est obligatoire')
      .refine((v) => v.startsWith('postgres'), 'DATABASE_URL doit pointer vers PostgreSQL'),

    APP_URL: z
      .string()
      .url()
      .default(renderBaseUrl ?? 'http://localhost:5173')
      .transform(preferRenderUrl),
    API_URL: z
      .string()
      .url()
      .default(renderBaseUrl ?? 'http://localhost:4000')
      .transform(preferRenderUrl),
    TRUST_PROXY: booleanFromEnv(false),

    // Secret de signature JWT (obligatoire en production)
    JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit faire au moins 32 caractères'),
    ACCESS_TOKEN_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),

    // CORS
    CORS_ORIGINS: z
      .string()
      .default(renderBaseUrl ?? 'http://localhost:5173,http://localhost:4000')
      .transform((value) => {
        const origins = value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);
        if (renderBaseUrl && origins.length > 0 && origins.every((o) => LOCAL_URL_PATTERN.test(o))) {
          return renderBaseUrl;
        }
        return value;
      }),

    // Sécurité applicative
    CSRF_SECRET: z.string().min(32, 'CSRF_SECRET doit faire au moins 32 caractères'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
    LOCK_DURATION_MINUTES: z.coerce.number().int().positive().default(15),

    // Uploads
    MAX_UPLOAD_MB: z.coerce.number().int().positive().default(10),
    UPLOAD_DIR: z.string().default('./storage/uploads'),

    // Email (SMTP)
    SMTP_HOST: z.string().default(''),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: booleanFromEnv(false),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    MAIL_FROM: z.string().default('B.A. Construction <contact@ba-construction.tg>'),
    MAIL_TO: z.string().default(''),
    MAIL_ENABLED: booleanFromEnv(false),

    // Seed / administrateur initial
    SEED_ADMIN_EMAIL: z.string().email().default('admin@ba-construction.tg'),
    SEED_ADMIN_PASSWORD: z.string().min(12).default('ChangeMe!2026Secure'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      if (env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message: 'JWT_SECRET et JWT_REFRESH_SECRET doivent être différents en production',
        });
      }
      if (env.APP_URL.startsWith('http://')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['APP_URL'],
          message: 'APP_URL doit utiliser HTTPS en production',
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join('.') || '(racine)'} : ${i.message}`)
    .join('\n');
  console.error(`\n\x1b[31m[CONFIG] Configuration d'environnement invalide :\x1b[0m\n${issues}\n`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  isDev: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
  corsOrigins: parsed.data.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  repoRoot,
  serverRoot,
  clientDist: path.join(repoRoot, 'client', 'dist'),
  // Les chemins relatifs sont résolus depuis la racine du dépôt : le serveur
  // peut être lancé depuis n'importe quel dossier (npm workspaces, systemd…).
  storageDir: path.resolve(repoRoot, parsed.data.UPLOAD_DIR),
  // Zone non servie publiquement : pieces jointes des leads, documents internes.
  privateDir: path.resolve(repoRoot, 'storage', 'private'),
} as const;

export type Env = typeof env;
