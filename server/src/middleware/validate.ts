import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { unprocessable } from '../lib/errors.js';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Middleware de validation : parse et *remplace* la donnée par la valeur validée
 * (donc normalisée et sans champ superflu — protection contre la mass assignment).
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query) as Record<string, unknown>;
        Object.defineProperty(req, 'query', { value: parsed, writable: true, configurable: true });
      }
      if (schemas.body) req.body = schemas.body.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({
          field: i.path.join('.') || '(racine)',
          message: i.message,
        }));
        return next(unprocessable('Données invalides', details));
      }
      return next(err);
    }
  };
}
