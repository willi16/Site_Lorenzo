import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from './logger.js';

if (env.cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadedAsset {
  publicId: string;
  url: string;
  resourceType: string;
}

/**
 * Envoie un média public (image, PDF, plan) vers Cloudinary.
 * Le fichier local n'est qu'un temporaire : l'appelant le supprime après succès.
 */
export async function uploadPublicAsset(file: Express.Multer.File): Promise<UploadedAsset> {
  const result: UploadApiResponse = await cloudinary.uploader.upload(file.path, {
    folder: env.CLOUDINARY_FOLDER,
    resource_type: 'auto',
    use_filename: false,
    overwrite: false,
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    resourceType: result.resource_type,
  };
}

/**
 * Supprime un média Cloudinary. Le type de ressource (image ou raw) n'est pas
 * stocké en base : on tente les deux, Cloudinary renvoyant « not found » pour
 * le mauvais type.
 */
export async function deletePublicAsset(publicId: string): Promise<void> {
  for (const resourceType of ['image', 'raw'] as const) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      if (result.result === 'ok') return;
    } catch (err) {
      logger.warn({ err, publicId, resourceType }, 'Échec de la suppression Cloudinary');
    }
  }
  logger.warn({ publicId }, 'Média Cloudinary introuvable lors de la suppression');
}

/** Les URLs locales commencent par « /uploads/ » ; tout le reste est externe. */
export function isExternalMediaUrl(url: string | null): boolean {
  return Boolean(url && /^https?:\/\//i.test(url));
}
