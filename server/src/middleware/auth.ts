import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { forbidden, unauthorized } from '../lib/errors.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  const cookie = req.cookies?.ba_access as string | undefined;
  return cookie ?? null;
}

/** Authentifie l'utilisateur si un jeton est présent, sans jamais bloquer la requête. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    /* jeton invalide : on continue en anonyme */
  }
  return next();
};

/** Exige un jeton d'accès valide. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next(unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
    return next();
  } catch (err) {
    return next(err);
  }
};

/** Restreint l'accès à certains rôles. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(forbidden("Vous n'avez pas les droits nécessaires pour cette action."));
    }
    return next();
  };
}

/** Vérifie que le compte est toujours actif en base (démission, blocage). */
export const ensureActiveAccount: RequestHandler = async (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { active: true },
  });
  if (!user || !user.active) return next(unauthorized('Compte désactivé'));
  return next();
};
