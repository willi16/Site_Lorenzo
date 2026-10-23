import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { directDataSource } from './directDataSource.js';
import { buildDocument } from './template.js';

interface EntryServerModule {
  render(
    url: string,
    options: { dataSource: unknown; headHtml?: string },
  ): Promise<{
    html: string;
    head: string;
    status: number;
    headers: Record<string, string>;
    hydrationData: {
      loaderData: unknown;
      actionData: unknown;
      errors: unknown;
    };
  }>;
}

let entryPromise: Promise<EntryServerModule> | null = null;

/** Charge (une seule fois) le bundle SSR produit par Vite côté client. */
async function loadEntry(): Promise<EntryServerModule> {
  if (!entryPromise) {
    const entryPath = path.join(env.repoRoot, 'client', 'dist-ssr', 'entry-server.js');
    entryPromise = import(pathToFileURL(entryPath).href) as Promise<EntryServerModule>;
    entryPromise.catch(() => {
      entryPromise = null;
    });
  }
  return entryPromise;
}

export interface RenderPageResult {
  html: string;
  status: number;
  headers: Record<string, string>;
}

/**
 * Rend une page côté serveur.
 *
 * Les données proviennent de PostgreSQL (accès direct), le HTML est produit par
 * React, puis injecté dans le gabarit Vite avec les balises SEO et les données
 * d'hydratation.
 */
export async function renderPage(url: string): Promise<RenderPageResult> {
  const entry = await loadEntry();
  const result = await entry.render(url, { dataSource: directDataSource });

  const document = buildDocument({
    html: result.html,
    head: result.head,
    hydrationData: result.hydrationData,
  });

  return {
    html: document,
    status: result.status,
    headers: result.headers,
  };
}

/** Vérifie que le bundle SSR est présent et exploitable. */
export async function isSsrAvailable(): Promise<boolean> {
  try {
    await loadEntry();
    return true;
  } catch (error) {
    logger.warn(
      { err: error },
      'Bundle SSR introuvable : le serveur fonctionnera en mode API uniquement. Lancez « npm run build --workspace client ».',
    );
    return false;
  }
}
