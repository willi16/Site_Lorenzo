import {
  listPosts,
  listProjects,
  listServices,
} from '../modules/content/repository.js';

const STATIC_ROUTES = [
  '/',
  '/services',
  '/realisations',
  '/le-cabinet',
  '/methodologie',
  '/actualites',
  '/budget',
  '/comparateur',
  '/contact',
  '/rechercher',
  '/mentions-legales',
  '/confidentialite',
  '/cookies',
];

/**
 * Génère la liste complète des routes à pré-rendre : pages statiques + contenus
 * publiés (services, projets, articles). Utilisé par le script prerender.ts.
 */
export async function generateStaticRoutes(): Promise<string[]> {
  const routes = new Set<string>(STATIC_ROUTES);

  try {
    const services = await listServices({ onlyPublished: true });
    for (const s of services) routes.add(`/services/${s.slug}`);
  } catch {
    // Contenu non disponible en mode build/prerender sans DB : on ignore
  }

  try {
    const projects = await listProjects({ limit: 200, onlyPublished: true });
    for (const p of projects.items) routes.add(`/realisations/${p.slug}`);
  } catch {
    // Ignoré si base indisponible
  }

  try {
    const posts = await listPosts({ limit: 200, onlyPublished: true });
    for (const p of posts.items) routes.add(`/actualites/${p.slug}`);
  } catch {
    // Ignoré si base indisponible
  }

  return Array.from(routes).sort();
}

export async function getStaticRoutes(): Promise<string[]> {
  return generateStaticRoutes();
}
