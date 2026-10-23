import type { Request } from 'express';
import { badRequest } from './errors.js';

/**
 * Lit un paramètre de route.
 *
 * Le middleware de validation Zod garantit normalement sa présence ; cette
 * fonction sert de filet si la validation est omise, et évite de manipuler des
 * `string | undefined` dans les handlers.
 */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw badRequest(`Paramètre de route manquant : ${name}.`);
  }
  return value;
}
