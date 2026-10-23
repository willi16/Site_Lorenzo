import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

/**
 * Gestionnaire de balises <head> minimaliste, compatible SSR + CSR.
 *
 * - Côté serveur : les balises sont collectées puis injectées dans le HTML.
 * - Côté client  : elles sont appliquées au document (réconciliation idempotente).
 *
 * Aucune dépendance externe : le code reste auditable et léger.
 */

export interface SeoProps {
  title: string;
  /** Méta-description ; par défaut le résumé du site est utilisé. */
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export interface HeadState {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type: 'website' | 'article' | 'profile';
  noindex: boolean;
  keywords: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale: string;
  jsonLd: Record<string, unknown>[];
}

export const SITE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
    ? import.meta.env.VITE_SITE_URL
    : 'https://ba-construction.tg'
).replace(/\/$/, '');

export const SITE_NAME = 'B.A. Construction';
export const SITE_TAGLINE = 'Architecture, construction et rénovation au Togo';
export const SITE_DESCRIPTION =
  "B.A. Construction, cabinet d'architecture et de construction à Lomé : architecture résidentielle, bâtiments commerciaux, rénovation, extension et aménagement au Togo.";

interface HeadApi {
  state: HeadState;
  collect: (props: SeoProps) => void;
}

const HeadContext = createContext<HeadApi | null>(null);

function emptyState(): HeadState {
  return {
    title: SITE_NAME,
    description: '',
    canonical: undefined,
    image: undefined,
    type: 'website',
    noindex: false,
    keywords: [],
    locale: 'fr_FR',
    jsonLd: [],
  };
}

function toState(props: SeoProps): HeadState {
  const jsonLd = props.jsonLd
    ? Array.isArray(props.jsonLd)
      ? props.jsonLd
      : [props.jsonLd]
    : [];
  return {
    title: props.title,
    description: props.description ?? SITE_DESCRIPTION,
    canonical: props.canonical,
    image: props.image,
    type: props.type ?? 'website',
    noindex: props.noindex ?? false,
    keywords: props.keywords ?? [],
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime,
    author: props.author,
    locale: props.locale ?? 'fr_FR',
    jsonLd,
  };
}

/* ───────────────────────────── Application côté client ────────────────────── */

const MANAGED_ATTR = 'data-seo';

function upsertMeta(doc: Document, key: string, name: string, content: string | undefined) {
  if (!content) return;
  let el = doc.head.querySelector<HTMLMetaElement>(`meta[${name}="${key}"]`);
  if (!el) {
    el = doc.createElement('meta');
    el.setAttribute(name, key);
    el.setAttribute(MANAGED_ATTR, 'true');
    doc.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(doc: Document, rel: string, href: string) {
  let el = doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][data-seo="true"]`);
  if (!el) {
    el = doc.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute(MANAGED_ATTR, 'true');
    doc.head.appendChild(el);
  }
  el.href = href;
}

function applyStateToDocument(state: HeadState) {
  if (typeof document === 'undefined') return;
  const doc = document;

  doc.title = state.title;

  upsertMeta(doc, 'description', 'name', state.description);
  upsertMeta(doc, 'robots', 'name', state.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  upsertMeta(doc, 'keywords', 'name', state.keywords.join(', '));
  upsertMeta(doc, 'og:title', 'property', state.title);
  upsertMeta(doc, 'og:description', 'property', state.description);
  upsertMeta(doc, 'og:type', 'property', state.type);
  upsertMeta(doc, 'og:site_name', 'property', SITE_NAME);
  upsertMeta(doc, 'og:locale', 'property', state.locale);
  upsertMeta(doc, 'og:url', 'property', state.canonical ?? '');
  upsertMeta(doc, 'og:image', 'property', state.image ? absoluteUrl(state.image) : '');
  upsertMeta(doc, 'twitter:card', 'name', state.image ? 'summary_large_image' : 'summary');
  upsertMeta(doc, 'twitter:title', 'name', state.title);
  upsertMeta(doc, 'twitter:description', 'name', state.description);
  upsertMeta(doc, 'twitter:image', 'name', state.image ? absoluteUrl(state.image) : '');
  if (state.publishedTime) upsertMeta(doc, 'article:published_time', 'property', state.publishedTime);
  if (state.modifiedTime) upsertMeta(doc, 'article:modified_time', 'property', state.modifiedTime);
  if (state.author) upsertMeta(doc, 'author', 'name', state.author);

  if (state.canonical) upsertLink(doc, 'canonical', absoluteUrl(state.canonical));

  // JSON-LD : on remplace intégralement le bloc géré
  doc.head.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
  for (const item of state.jsonLd) {
    const script = doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', 'true');
    script.textContent = JSON.stringify(item);
    doc.head.appendChild(script);
  }
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/* ──────────────────────────────── Collecteur serveur ─────────────────────── */

export class HeadCollector {
  state: HeadState = emptyState();

  collect(props: SeoProps) {
    this.state = toState(props);
  }
}

export function HeadProvider({
  children,
  collector,
}: {
  children: ReactNode;
  collector?: HeadCollector;
}) {
  const value = useMemo<HeadApi>(
    () => ({
      state: collector?.state ?? emptyState(),
      collect: (props: SeoProps) => {
        if (collector) {
          collector.collect(props);
        } else {
          applyStateToDocument(toState(props));
        }
      },
    }),
    [collector],
  );

  return <HeadContext.Provider value={value}>{children}</HeadContext.Provider>;
}

/* ─────────────────────────────── Composant <Seo> ────────────────────────── */

export function Seo(props: SeoProps) {
  const ctx = useContext(HeadContext);
  if (!ctx) throw new Error("<Seo> doit être utilisé à l'intérieur de <HeadProvider>");

  // Collecte immédiate (indispensable au rendu serveur : pas d'effet en SSR).
  ctx.collect(props);

  // Côté client, on réapplique après le commit pour rester compatible avec la
  // navigation côté client. La sérialisation des props couvre *toutes* les
  // valeurs consommées : une dépendance manquante laissait des balises SEO
  // obsolètes (mots-clés, JSON-LD, article:published_time) après navigation.
  const serialized = JSON.stringify(toState(props));
  useEffect(() => {
    applyStateToDocument(JSON.parse(serialized) as HeadState);
  }, [serialized]);

  return null;
}

export function useHeadState(): HeadState {
  const ctx = useContext(HeadContext);
  return ctx?.state ?? emptyState();
}

/* ─────────────────────────── Générateurs JSON-LD ────────────────────────── */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ArchitecturalService',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'BA Construction Togo',
    description:
      "Cabinet d'architecture et de construction basé au Togo : construction résidentielle, bâtiments commerciaux, rénovation, extension et aménagement.",
    url: SITE_URL,
    telephone: '+22891085550',
    email: 'contact@ba-construction.tg',
    slogan: SITE_TAGLINE,
    image: absoluteUrl('/og-image.svg'),
    logo: absoluteUrl('/logo.svg'),
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Boulevard du Mono, Tokoin',
      addressLocality: 'Lomé',
      addressRegion: 'Maritime',
      addressCountry: 'TG',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 6.1256, longitude: 1.2254 },
    areaServed: [
      { '@type': 'Country', name: 'Togo' },
      { '@type': 'Country', name: 'Bénin' },
      { '@type': 'Country', name: 'Ghana' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '14:00' },
    ],
    sameAs: [
      'https://www.instagram.com/ba.construction',
      'https://www.linkedin.com/company/ba-construction',
      'https://www.facebook.com/ba.construction',
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/rechercher?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function projectSchema(project: {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  image: string | null;
  year: number;
  area: number;
  location: string;
  materials: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.title,
    description: project.excerpt || project.description.slice(0, 300),
    url: absoluteUrl(`/realisations/${project.slug}`),
    image: project.image ? absoluteUrl(project.image) : absoluteUrl('/og-image.svg'),
    dateCreated: String(project.year),
    creator: { '@id': `${SITE_URL}/#organization` },
    about: project.materials,
    spatialCoverage: { '@type': 'Place', name: project.location },
    size: { '@type': 'QuantitativeValue', value: project.area, unitText: 'm2' },
  };
}

export function articleSchema(post: {
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  publishedAt: string;
  author: string;
  readMinutes: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/actualites/${post.slug}`),
    image: post.image ? absoluteUrl(post.image) : absoluteUrl('/og-image.svg'),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/actualites/${post.slug}`) },
    timeRequired: `PT${post.readMinutes}M`,
    inLanguage: 'fr-FR',
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
