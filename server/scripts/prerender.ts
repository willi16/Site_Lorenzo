#!/usr/bin/env tsx
/**
 * Pré-rendu (prerender) des pages statiques.
 *
 * Ce script génère des fichiers HTML statiques pour les routes publiques
 * importantes afin d'accélérer l'indexation. Il utilise le même moteur de
 * rendu SSR que le serveur (createStaticHandler + renderToString).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateStaticRoutes } from '../src/seo/sitemapRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(SERVER_DIR, '..');
const CLIENT_DIST = path.resolve(ROOT, 'client', 'dist');
const OUTPUT_DIR = path.resolve(CLIENT_DIST, 'prerendered');

const SITE_URL = process.env.APP_URL ?? 'http://localhost:4000';

const SKIP = new Set(['/admin', '/admin/login', '/newsletter/confirmer']);

async function main() {
  console.log('Démarrage du pré-rendu...');
  console.log(`Site URL : ${SITE_URL}`);
  console.log(`Sortie    : ${OUTPUT_DIR}`);

  const routes = (await generateStaticRoutes()).filter((r) => !SKIP.has(r));
  console.log(`${routes.length} route(s) à pré-rendre`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Copie de l'index.html comme base si nécessaire (le moteur SSR gère déjà)
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error(`index.html introuvable dans ${CLIENT_DIST}`);
    process.exit(1);
  }

  const { renderPage } = await import('../src/ssr/render.js');

  let ok = 0;
  let failed = 0;

  for (const route of routes) {
    try {
      const url = `${SITE_URL}${route}`;
      const result = await renderPage(url);
      const dir = route === '/' ? OUTPUT_DIR : path.join(OUTPUT_DIR, route.replace(/^\//, ''));
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, 'index.html');
      fs.writeFileSync(filePath, result.html, 'utf8');
      console.log(`  ✓ ${route} (${result.status})`);
      ok += 1;
    } catch (error) {
      console.error(`  ✗ ${route}`, error instanceof Error ? error.message : error);
      failed += 1;
    }
  }

  console.log(`\nPré-rendu terminé : ${ok} succès, ${failed} échec(s)`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error('Erreur fatale :', error);
  process.exit(1);
});
