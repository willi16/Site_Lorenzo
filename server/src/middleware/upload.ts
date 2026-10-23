import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import type { Request } from 'express';
import { env } from '../config/env.js';
import { badRequest } from '../lib/errors.js';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
  'application/dwg',
  'application/x-dwg',
  'application/octet-stream',
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.pdf', '.dwg', '.dxf']);

fs.mkdirSync(env.storageDir, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    fs.mkdirSync(env.storageDir, { recursive: true });
    cb(null, env.storageDir);
  },
  filename(_req, file, cb) {
    // Nom aléatoire : on ne fait jamais confiance au nom fourni par le client
    // (protection contre path traversal et collision de noms).
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const safeExt = ALLOWED_EXT.has(ext) ? ext : '.bin';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 6,
    fields: 20,
  },
  fileFilter(_req: Request, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
      cb(badRequest(`Type de fichier non autorisé : ${file.mimetype}. Formats acceptés : JPG, PNG, WebP, PDF, DWG.`));
      return;
    }
    cb(null, true);
  },
});

/** Transforme un fichier multer en enregistrement Media + URL publique. */
export function toMediaPayload(file: Express.Multer.File) {
  return {
    filename: file.filename,
    originalName: file.originalname,
    url: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
  };
}

/**
 * Instance dédiée aux pièces jointes envoyées par les visiteurs (formulaire de
 * contact). Les fichiers sont écrits hors du dossier servi publiquement : ils ne
 * sont consultables que par un administrateur authentifié.
 */
export const privateUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      fs.mkdirSync(env.privateDir, { recursive: true });
      cb(null, env.privateDir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
      const safeExt = ALLOWED_EXT.has(ext) ? ext : '.bin';
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`);
    },
  }),
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 6,
    fields: 20,
  },
  fileFilter(_req: Request, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
      cb(badRequest(`Type de fichier non autorisé : ${file.mimetype}. Formats acceptés : JPG, PNG, WebP, PDF, DWG.`));
      return;
    }
    cb(null, true);
  },
});
