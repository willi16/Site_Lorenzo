import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server';
import { HeadCollector, HeadProvider } from '@/lib/seo';
import { setDataSource, type DataSource } from '@/lib/data';
import { routes } from './app/routes';

export interface RenderOptions {
  /** Source de données injectée par le serveur (accès direct à PostgreSQL). */
  dataSource: DataSource;
  /** Balises <head> déjà présentes dans le gabarit HTML (à conserver). */
  headHtml?: string;
}

export interface RenderResult {
  html: string;
  head: string;
  status: number;
  headers: Record<string, string>;
  /** Données de navigation transmises au navigateur pour l'hydratation. */
  hydrationData: {
    loaderData: unknown;
    actionData: unknown;
    errors: unknown;
  };
}

/**
 * Rendu serveur d'une page.
 *
 * Le routeur statique de React Router exécute les loaders côté serveur : les
 * données proviennent donc directement de PostgreSQL, sans passer par HTTP.
 */
export async function render(url: string, options: RenderOptions): Promise<RenderResult> {
  setDataSource(options.dataSource);

  const handler = createStaticHandler(routes);
  const request = new Request(url, { method: 'GET' });

  let context;
  try {
    context = await handler.query(request);
  } catch (error) {
    if (error instanceof Response) {
      return {
        html: '',
        head: '',
        status: error.status,
        headers: Object.fromEntries(error.headers.entries()),
        hydrationData: { loaderData: {}, actionData: null, errors: null },
      };
    }
    throw error;
  }

  if (context instanceof Response) {
    return {
      html: '',
      head: '',
      status: context.status,
      headers: Object.fromEntries(context.headers.entries()),
      hydrationData: { loaderData: {}, actionData: null, errors: null },
    };
  }

  const collector = new HeadCollector();
  const router = createStaticRouter(handler.dataRoutes, context);

  const html = renderToString(
    <HeadProvider collector={collector}>
      <StaticRouterProvider router={router} context={context} />
    </HeadProvider>,
  );

  const state = collector.state;
  const head = buildHead(state, options.headHtml ?? '');

  // La route « * » affiche la page 404 : le code HTTP doit l'indiquer.
  const deepestMatch = context.matches[context.matches.length - 1];
  const isNotFound = deepestMatch?.route.path === '*';

  return {
    html,
    head,
    status: isNotFound ? 404 : (context.statusCode ?? 200),
    headers: {},
    hydrationData: {
      loaderData: context.loaderData ?? {},
      actionData: context.actionData ?? null,
      errors: context.errors ?? null,
    },
  };
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function buildHead(
  state: {
    title: string;
    description: string;
    canonical?: string;
    image?: string;
    type: string;
    noindex: boolean;
    keywords: string[];
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    locale: string;
    jsonLd: Record<string, unknown>[];
  },
  existing: string,
): string {
  const siteUrl = (
    (import.meta.env?.VITE_SITE_URL as string | undefined) ?? 'https://ba-construction.tg'
  ).replace(/\/$/, '');
  const canonical = state.canonical ? `${siteUrl}${state.canonical}` : undefined;
  const image = state.image ? `${siteUrl}${state.image}` : `${siteUrl}/og-image.svg`;

  const tags: string[] = [
    `<title>${escapeAttr(state.title)}</title>`,
    `<meta name="description" content="${escapeAttr(state.description)}" />`,
    `<meta name="robots" content="${state.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}" />`,
  ];

  if (state.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${escapeAttr(state.keywords.join(', '))}" />`);
  }
  if (canonical) {
    tags.push(`<link rel="canonical" href="${escapeAttr(canonical)}" />`);
  }

  tags.push(
    `<meta property="og:type" content="${state.type}" />`,
    `<meta property="og:site_name" content="B.A. Construction" />`,
    `<meta property="og:locale" content="${state.locale}" />`,
    `<meta property="og:title" content="${escapeAttr(state.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(state.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical ?? siteUrl)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(state.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(state.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
  );

  if (state.publishedTime) {
    tags.push(`<meta property="article:published_time" content="${escapeAttr(state.publishedTime)}" />`);
  }
  if (state.modifiedTime) {
    tags.push(`<meta property="article:modified_time" content="${escapeAttr(state.modifiedTime)}" />`);
  }
  if (state.author) {
    tags.push(`<meta name="author" content="${escapeAttr(state.author)}" />`);
  }

  for (const item of state.jsonLd) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`,
    );
  }

  return `${existing}\n${tags.join('\n    ')}`;
}
