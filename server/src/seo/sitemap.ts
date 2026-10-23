import {
  listPosts,
  listProjects,
  listServices,
} from '../modules/content/repository.js';
import { env } from '../config/env.js';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * Sitemap XML généré à la demande à partir du contenu publié.
 * Les pages statiques et les contenus dynamiques (projets, articles, services)
 * sont fusionnés dans un document unique, référencé par robots.txt.
 */
export async function buildSitemap(): Promise<string> {
  const base = (env.APP_URL || process.env.APP_URL || 'http://localhost:4000').replace(/\/$/, '');

  const [services, projects, posts] = await Promise.all([
    listServices({ onlyPublished: true }),
    listProjects({ limit: 200, onlyPublished: true }),
    listPosts({ limit: 200, onlyPublished: true }),
  ]);

  const now = new Date().toISOString().slice(0, 10);

  const entries: UrlEntry[] = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/services', changefreq: 'monthly', priority: '0.9' },
    { loc: '/realisations', changefreq: 'weekly', priority: '0.9' },
    { loc: '/le-cabinet', changefreq: 'monthly', priority: '0.7' },
    { loc: '/methodologie', changefreq: 'monthly', priority: '0.7' },
    { loc: '/actualites', changefreq: 'weekly', priority: '0.8' },
    { loc: '/budget', changefreq: 'monthly', priority: '0.8' },
    { loc: '/comparateur', changefreq: 'monthly', priority: '0.6' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.9' },
    { loc: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
    { loc: '/confidentialite', changefreq: 'yearly', priority: '0.3' },
    { loc: '/cookies', changefreq: 'yearly', priority: '0.3' },
  ];

  for (const service of services) {
    entries.push({
      loc: `/services/${service.slug}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.8',
    });
  }

  for (const project of projects.items) {
    entries.push({
      loc: `/realisations/${project.slug}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  for (const post of posts.items) {
    entries.push({
      loc: `/actualites/${post.slug}`,
      lastmod: typeof post.publishedAt === 'string' ? post.publishedAt.slice(0, 10) : now,
      changefreq: 'monthly',
      priority: '0.6',
    });
  }

  const urls = entries
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(`${base}${entry.loc}`)}</loc>${
          entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
        }${entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ''}${
          entry.priority ? `\n    <priority>${entry.priority}</priority>` : ''
        }\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
