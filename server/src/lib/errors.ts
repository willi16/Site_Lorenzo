/**
 * Erreurs applicatives normalisées.
 * Toute erreur qui sort d'un handler doit être une AppError : le middleware
 * d'erreur global la transforme en réponse JSON homogène, sans fuite d'information.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, 'BAD_REQUEST', message, details);
export const unauthorized = (message = 'Authentification requise') =>
  new AppError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'Accès refusé') => new AppError(403, 'FORBIDDEN', message);
export const notFound = (message = 'Ressource introuvable') =>
  new AppError(404, 'NOT_FOUND', message);
export const conflict = (message: string, details?: unknown) =>
  new AppError(409, 'CONFLICT', message, details);
export const payloadTooLarge = (message = 'Fichier trop volumineux') =>
  new AppError(413, 'PAYLOAD_TOO_LARGE', message);
export const tooManyRequests = (message = 'Trop de requêtes, réessayez plus tard') =>
  new AppError(429, 'TOO_MANY_REQUESTS', message);
export const unprocessable = (message: string, details?: unknown) =>
  new AppError(422, 'UNPROCESSABLE', message, details);
