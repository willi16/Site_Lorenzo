import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route introuvable : ${req.method} ${req.originalUrl}`));
};

/**
 * Gestionnaire d'erreurs central.
 * Les erreurs opérationnelles sont renvoyées telles quelles ; les autres sont
 * masquées derrière un message générique (pas de fuite de stack trace en production).
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // La réponse a déjà été entamée (flux de fichier, redirection…) : il est
  // impossible d'écrire un corps JSON. On coupe la connexion pour éviter
  // une seconde erreur « headers already sent » qui masquerait la cause réelle.
  if (res.headersSent) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Erreur après envoi de la réponse');
    res.destroy();
    return;
  }

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Une erreur interne est survenue. Réessayez plus tard.';
  let details: unknown;

  if (err instanceof AppError) {
    status = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 422;
    code = 'UNPROCESSABLE';
    message = 'Données invalides';
    details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      status = 409;
      code = 'CONFLICT';
      message = 'Cette ressource existe déjà';
    } else if (err.code === 'P2025') {
      status = 404;
      code = 'NOT_FOUND';
      message = 'Ressource introuvable';
    } else {
      logger.error({ err, code: err.code }, 'Erreur Prisma');
    }
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    code = 'UPLOAD_ERROR';
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Fichier trop volumineux (max ${env.MAX_UPLOAD_MB} Mo)`
        : err.message;
  } else if (err instanceof SyntaxError && 'body' in err) {
    status = 400;
    code = 'BAD_REQUEST';
    message = 'Corps de requête JSON invalide';
  }

  if (status >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Erreur serveur');
  } else {
    logger.warn({ code, path: req.originalUrl, method: req.method }, 'Requête rejetée');
  }

  res.status(status).json({
    ok: false,
    error: { code, message, ...(details ? { details } : {}) },
    ...(env.isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
};
