import { redirect, useLoaderData } from 'react-router-dom';
import { getDataSource, type DataSource } from '@/lib/data';
import type { LoaderFunctionArgs } from 'react-router-dom';

const ds = (): DataSource => getDataSource();

export async function homeLoader() {
  const source = ds();
  const [services, projectsResult, testimonials, postsResult, stats, steps, certifications] =
    await Promise.all([
      source.listServices(),
      source.listProjects({ limit: 8, featured: true, sort: 'recent' }),
      source.listTestimonials(),
      source.listPosts({ limit: 3 }),
      source.listStats(),
      source.listProcessSteps(),
      source.listCertifications(),
    ]);
  return {
    services,
    projects: projectsResult.items,
    testimonials,
    posts: postsResult.items,
    stats,
    steps,
    certifications,
  };
}

export async function servicesLoader() {
  const source = ds();
  const [services, projectsResult] = await Promise.all([
    source.listServices(),
    source.listProjects({ limit: 6, sort: 'recent' }),
  ]);
  return { services, projects: projectsResult.items };
}

export async function serviceLoader({ params }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug) throw redirect('/services');
  const data = await ds().getService(slug);
  if (!data) throw new Response('Service introuvable', { status: 404 });
  return data;
}

export async function projectsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const source = ds();

  const [result, facets] = await Promise.all([
    source.listProjects({
      category: (params.get('category') as never) ?? undefined,
      location: params.get('location') ?? undefined,
      year: params.get('year') ? Number(params.get('year')) : undefined,
      minArea: params.get('minArea') ? Number(params.get('minArea')) : undefined,
      maxArea: params.get('maxArea') ? Number(params.get('maxArea')) : undefined,
      maxBudget: params.get('maxBudget') ? Number(params.get('maxBudget')) : undefined,
      q: params.get('q') ?? undefined,
      sort: (params.get('sort') as never) ?? 'recent',
    }),
    source.getProjectFacets(),
  ]);

  return { projects: result.items, total: result.total, facets };
}

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug) throw redirect('/realisations');
  const data = await ds().getProject(slug);
  if (!data) throw new Response('Projet introuvable', { status: 404 });
  return data;
}

export async function aboutLoader() {
  const source = ds();
  const [team, certifications, partners, stats, testimonials, services, projectsResult] =
    await Promise.all([
      source.listTeam(),
      source.listCertifications(),
      source.listPartners(),
      source.listStats(),
      source.listTestimonials(),
      source.listServices(),
      source.listProjects({ limit: 4, sort: 'recent' }),
    ]);
  return {
    team,
    certifications,
    partners,
    stats,
    testimonials,
    services,
    projects: projectsResult.items,
  };
}

export async function methodologyLoader() {
  const source = ds();
  const [steps, services, stats, postsResult] = await Promise.all([
    source.listProcessSteps(),
    source.listServices(),
    source.listStats(),
    source.listPosts({ limit: 3, category: 'CONSEILS' }),
  ]);
  return { steps, services, stats, posts: postsResult.items };
}

export async function blogLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const source = ds();
  const [result, popular] = await Promise.all([
    source.listPosts({
      category: params.get('categorie') ?? undefined,
      q: params.get('q') ?? undefined,
      limit: 12,
    }),
    source.listPosts({ limit: 5 }),
  ]);
  return { posts: result.items, total: result.total, popular: popular.items };
}

export async function blogPostLoader({ params }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug) throw redirect('/actualites');
  const data = await ds().getPost(slug);
  if (!data) throw new Response('Article introuvable', { status: 404 });
  return data;
}

export async function contactLoader() {
  const services = await ds().listServices();
  return { services };
}

export async function budgetLoader() {
  const tariffs = await ds().getTariffs();
  return { tariffs };
}

export async function compareLoader() {
  const { items } = await ds().listProjects({ limit: 24, sort: 'recent' });
  return { projects: items };
}

export async function searchLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const source = ds();

  if (!q) return { q, projects: [], posts: [], services: [] };

  const [projects, posts, services] = await Promise.all([
    source.listProjects({ q, limit: 12 }),
    source.listPosts({ q, limit: 8 }),
    source.listServices(),
  ]);

  return {
    q,
    projects: projects.items,
    posts: posts.items,
    services: services.filter((s) =>
      `${s.title} ${s.excerpt} ${s.description}`.toLowerCase().includes(q.toLowerCase()),
    ),
  };
}

/**
 * React Router v6 n'expose pas `useLoaderData` sous forme générique.
 * Ce wrapper restaure le typage du loader, vérifié par le compilateur :
 * `useLoaderDataOf<typeof blogLoader>()`.
 */
export function useLoaderDataOf<TLoader extends (...args: never[]) => unknown>(): Awaited<
  ReturnType<TLoader>
> {
  return useLoaderData() as Awaited<ReturnType<TLoader>>;
}
