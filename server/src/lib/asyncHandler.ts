import { createRequire } from 'node:module';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Enveloppe un handler asynchrone pour que ses rejets soient transmis à
 * Express.
 *
 * Express 4 n'intercepte pas les promesses : une fonction `async` qui lève une
 * erreur (`throw badRequest(...)`) produit une « promesse rejetée non gérée »
 * et la requête reste en attente jusqu'à expiration côté client. On rattache
 * donc explicitement le rejet à `next()`, ce qui laisse le gestionnaire
 * d'erreurs central produire la réponse JSON attendue.
 *
 * Utile pour les handlers définis hors des routeurs (par ex. `app.get`).
 */
export function asyncHandler<Req extends Request = Request>(
  handler: (req: Req, res: Response, next: NextFunction) => unknown | Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req as Req, res, next)).catch(next);
  };
}

const PATCHED = Symbol.for('ba.asyncErrorHandling.patched');

/**
 * Rend Express 4 capable de rattacher les rejets des handlers `async` au
 * middleware d'erreurs.
 *
 * L'ensemble du code applicatif suit le style « throw » : un handler
 * asynchrone lève une `AppError` et compte sur `errorHandler` pour produire la
 * réponse. Express 4 ne rattrape que les exceptions synchrones
 * (`Layer.prototype.handle_request`). Plutôt que d'envelopper chaque handler
 * (65+ occurrences), on étend ce point de dispatch unique pour qu'il observe
 * aussi la promesse renvoyée par le handler.
 *
 * L'opération est idempotente.
 */
export function installAsyncErrorHandling(): void {
  // Import paresseux : évite une dépendance ESM fragile vers les internes
  // d'Express au chargement du module.
  const require = createRequire(import.meta.url);
  const layerModule = require('express/lib/router/layer.js') as {
    prototype: {
      handle_request: (req: Request, res: Response, next: NextFunction) => unknown;
      [PATCHED]?: boolean;
    };
  };
  const prototype = layerModule.prototype;
  if (prototype[PATCHED]) return;

  Object.defineProperty(prototype, PATCHED, { value: true, enumerable: false });

  const original = prototype.handle_request;

  prototype.handle_request = function patchedHandleRequest(
    this: { handle: RequestHandler },
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const fn = this.handle;
    if (typeof fn !== 'function' || fn.length > 3) return original.call(this, req, res, next);
    try {
      const result = fn(req, res, next) as unknown;
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        (result as Promise<unknown>).catch(next);
      }
      return result;
    } catch (error) {
      return next(error);
    }
  };
}
