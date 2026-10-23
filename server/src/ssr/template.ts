import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

const OUTLET_MARKER = '<!--ssr-outlet-->';

let cachedTemplate: string | null = null;

/** Gabarit HTML produit par la compilation Vite (client/dist/index.html). */
export function getTemplate(): string {
  if (cachedTemplate) return cachedTemplate;
  const file = path.join(env.clientDist, 'index.html');
  if (!fs.existsSync(file)) {
    throw new Error(
      `Gabarit HTML introuvable : ${file}. Lancez « npm run build --workspace client » avant de démarrer le serveur.`,
    );
  }
  cachedTemplate = fs.readFileSync(file, 'utf8');
  return cachedTemplate;
}

export interface DocumentInput {
  /** Markup rendu par React (string). */
  html: string;
  /** Balises <head> produites par le gestionnaire SEO. */
  head: string;
  /** Données de navigation sérialisées pour l'hydratation. */
  hydrationData: unknown;
  /** Balises <head> déjà présentes dans le gabarit (on les conserve). */
  templateHead?: string;
}

/**
 * Assemble le document final : gabarit Vite + contenu rendu + balises SEO
 * + données d'hydratation. Le document reste valide même si le rendu
 * échoue (on renvoie alors le squelette statique).
 */
export function buildDocument(input: DocumentInput): string {
  const template = getTemplate();

  const head = input.templateHead
    ? input.head.replace(input.templateHead, '')
    : input.head;

  let document = template;

  // 0. Le rendu de React Router injecte son propre script d'hydratation
  //    (window.__staticRouterHydrationData) à l'intérieur du conteneur #root.
  //    Nous injectons déjà nos propres données (window.__reactRouterContext) :
  //    on retire ce script pour que le balisage corresponde exactement à ce
  //    que le navigateur hydratera.
  const ssrHtml = input.html.replace(
    /<script>window\.__staticRouterHydrationData[\s\S]*?<\/script>/g,
    '',
  );

  // 1. Contenu rendu
  if (document.includes(OUTLET_MARKER)) {
    document = document.replace(OUTLET_MARKER, ssrHtml);
  } else {
    document = document.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${ssrHtml}</div>`,
    );
  }

  // 2. Balises SEO (avant la fermeture de </head>)
  if (head.trim()) {
    // Le gabarit Vite contient un <title> et une méta-description de repli :
    // on les retire pour ne garder qu'une seule version, générée par le
    // gestionnaire SEO (une page = un title, une description).
    document = document.replace(/<title>[\s\S]*?<\/title>/i, '');
    document = document.replace(/<meta[^>]*name=["']description["'][^>]*>/i, '');

    document = document.includes('</head>')
      ? document.replace('</head>', `    ${head.trim()}\n  </head>`)
      : `${head}\n${document}`;
  }

  // 3. Données d'hydratation
  const payload = JSON.stringify(input.hydrationData ?? null).replace(/</g, '\\u003c');
  const hydration = `<script>window.__reactRouterContext=${payload};</script>`;
  document = document.includes('</body>')
    ? document.replace('</body>', `    ${hydration}\n  </body>`)
    : `${document}\n${hydration}`;

  return document;
}
