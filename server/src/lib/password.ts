import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

/**
 * Stockage de mots de passe via scrypt (RFC 7914), fourni par le module `crypto` de Node.
 * Format : scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>
 * - salt de 16 octets aléatoire par mot de passe (jamais réutilisé)
 * - comparaison en temps constant via timingSafeEqual
 * - paramètres de coût strengthening (N=16384) alignés sur les recommandations OWASP
 */
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;
const KEYLEN = 64;
const SALT_BYTES = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derived = await scrypt(password.normalize('NFKC'), salt, KEYLEN, PARAMS);
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('hex'),
    derived.toString('hex'),
  ].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, n, r, p, saltHex, hashHex] = stored.split('$');
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

    const expected = Buffer.from(hashHex, 'hex');
    const derived = await scrypt(
      password.normalize('NFKC'),
      Buffer.from(saltHex, 'hex'),
      expected.length,
      { N: Number(n), r: Number(r), p: Number(p), maxmem: PARAMS.maxmem },
    );
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Génère un token opaque cryptographiquement sûr (refresh token, tokens newsletter…). */
export function generateSecureToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** Hash déterministe (sha256) pour indexer un token en base sans le stocker en clair. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function randomHex(bytes = 8): string {
  return crypto.randomBytes(bytes).toString('hex');
}
