import crypto from 'node:crypto';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { env } from '../config/env.js';
import { forbidden } from '../lib/errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
export const CSRF_COOKIE = 'ba_csrf';
export const CSRF_HEADER = 'x-csrf-token';

function sign(value: string): string {
  return crypto.createHmac('sha256', env.CSRF_SECRET).update(value).digest('base64url');
}

/**
 * Protection CSRF « double submit cookie » signée.
 * Le cookie est lisible par le JS (contrairement au cookie de session httpOnly) :
 * le front le recopie dans l'en-tête X-CSRF-Token, et le serveur vérifie
 * (a) que la signature est valide, (b) que la valeur correspond bien au cookie.
 */
export function issueCsrfToken(res: Response): string {
  const nonce = crypto.randomBytes(24).toString('base64url');
  const token = `${nonce}.${sign(nonce)}`;
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.isProd,
    path: '/',
    maxAge: 12 * 60 * 60 * 1000,
  });
  return token;
}

export const csrfProtection: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.get(CSRF_HEADER) ?? (req.body as { csrfToken?: string } | undefined)?.csrfToken;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(forbidden('Jeton CSRF invalide ou expiré. Rechargez la page et réessayez.'));
  }

  const [nonce, signature] = cookieToken.split('.');
  if (!nonce || !signature) return next(forbidden('Jeton CSRF malformé.'));

  const expected = sign(nonce);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return next(forbidden('Signature CSRF invalide.'));
  }

  return next();
};
