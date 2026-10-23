import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { unauthorized } from './errors.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  typ: 'access';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'typ'>): string {
  return jwt.sign({ ...payload, typ: 'access' }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
    issuer: 'ba-construction',
    audience: 'ba-construction-web',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'ba-construction',
      audience: 'ba-construction-web',
    });
    if (typeof decoded === 'string' || decoded.typ !== 'access') {
      throw new Error('Type de token invalide');
    }
    return decoded as unknown as AccessTokenPayload;
  } catch {
    throw unauthorized('Session expirée ou invalide');
  }
}

/** Génère un JTI (identifiant unique) pour la révocation de session. */
export function createJti(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
