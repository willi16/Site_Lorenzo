import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { signAccessToken, verifyAccessToken } from '../../lib/jwt.js';
import { generateSecureToken, hashToken, hashPassword, verifyPassword } from '../../lib/password.js';
import { unauthorized, badRequest, tooManyRequests } from '../../lib/errors.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { logger } from '../../lib/logger.js';

const router = Router();

export const ACCESS_COOKIE = 'ba_access';
export const REFRESH_COOKIE = 'ba_refresh';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

// Hash factice utilisé quand l'utilisateur n'existe pas : le temps de réponse reste
// constant, ce qui empêche l'énumération de comptes par timing.
const DUMMY_HASH = 'scrypt$16384$8$1$00000000000000000000000000000000$00';

const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.isProd,
  path: '/',
};

import type { Response } from 'express';
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: ACCESS_MAX_AGE_MS });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieBase, maxAge: REFRESH_MAX_AGE_MS });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...cookieBase });
  res.clearCookie(REFRESH_COOKIE, { ...cookieBase });
}

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide').max(160),
  password: z.string().min(8, 'Mot de passe trop court').max(200),
});

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      await verifyPassword(password, DUMMY_HASH);
      throw unauthorized('Identifiants incorrects');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw tooManyRequests(`Compte temporairement verrouillé. Réessayez dans ${minutes} minute(s).`);
    }

    if (!user.active) throw unauthorized('Compte désactivé. Contactez l’administrateur.');

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      const failed = user.failedLogins + 1;
      const shouldLock = failed >= env.MAX_LOGIN_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins: shouldLock ? 0 : failed,
          lockedUntil: shouldLock
            ? new Date(Date.now() + env.LOCK_DURATION_MINUTES * 60 * 1000)
            : user.lockedUntil,
        },
      });
      logger.warn({ email: normalizedEmail, shouldLock }, 'Échec de connexion');
      throw unauthorized(
        shouldLock
          ? `Trop de tentatives. Compte verrouillé ${env.LOCK_DURATION_MINUTES} minutes.`
          : 'Identifiants incorrects',
      );
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const refreshToken = generateSecureToken(48);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_MAX_AGE_MS),
        userAgent: req.get('user-agent')?.slice(0, 300),
        ip: req.ip,
      },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      ok: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  },
);

/**
 * Rotation de jeton : chaque refresh invalide le jeton précédent.
 * Si un jeton déjà consommé est ré presented, toute la famille est révoquée
 * (détection de vol de jeton).
 */
router.post('/refresh', authLimiter, async (req, res) => {
  const presented = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!presented) throw unauthorized('Session expirée');

  const tokenHash = hashToken(presented);

  // Mise à jour atomique avec garde `revokedAt IS NULL`. Si deux requêtes
  // concurrentes présentent le même jeton de rafraîchissement, seule la
  // première met à jour la ligne : la seconde obtient `count === 0` et nous
  // déclenchons la révocation de toute la famille (détection de réutilisation).
  const result = await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  if (result.count === 0) {
    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (existing && existing.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      clearAuthCookies(res);
      logger.error({ userId: existing.userId }, 'Réutilisation de jeton détectée — famille révoquée');
      throw unauthorized('Session compromise. Veuillez vous reconnecter.');
    }
    clearAuthCookies(res);
    throw unauthorized('Session expirée');
  }

  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      user: { select: { id: true, email: true, name: true, role: true, active: true } },
    },
  });

  if (!record || record.expiresAt < new Date() || !record.user.active) {
    clearAuthCookies(res);
    throw unauthorized('Session expirée');
  }

  const accessToken = signAccessToken({
    sub: record.user.id,
    email: record.user.email,
    name: record.user.name,
    role: record.user.role,
  });
  const refreshToken = generateSecureToken(48);

  await prisma.refreshToken.create({
    data: {
      userId: record.user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE_MS),
      userAgent: req.get('user-agent')?.slice(0, 300),
      ip: req.ip,
    },
  });

  setAuthCookies(res, accessToken, refreshToken);
  res.json({
    ok: true,
    data: {
      user: { id: record.user.id, name: record.user.name, email: record.user.email, role: record.user.role },
    },
  });
});

router.post('/logout', async (req, res) => {
  const presented = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (presented) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(presented), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  clearAuthCookies(res);
  res.json({ ok: true, data: { message: 'Déconnexion réussie' } });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true },
  });
  res.json({ ok: true, data: user });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(200),
  newPassword: z
    .string()
    .min(12, 'Le nouveau mot de passe doit contenir au moins 12 caractères')
    .max(200)
    .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), {
      message: 'Le mot de passe doit contenir une minuscule, une majuscule et un chiffre',
    }),
});

router.post(
  '/change-password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw unauthorized();

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw badRequest('Mot de passe actuel incorrect');
    }
    if (await verifyPassword(newPassword, user.passwordHash)) {
      throw badRequest('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(newPassword) },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    clearAuthCookies(res);
    res.json({ ok: true, data: { message: 'Mot de passe mis à jour. Reconnectez-vous.' } });
  },
);

router.post('/verify', validate({ body: z.object({ token: z.string().min(10) }) }), async (req, res) => {
  try {
    verifyAccessToken((req.body as { token: string }).token);
    res.json({ ok: true, data: { valid: true } });
  } catch {
    res.json({ ok: true, data: { valid: false } });
  }
});

export default router;
