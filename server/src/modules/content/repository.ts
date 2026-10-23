import type { PostCategory, Prisma, ProjectCategory, ProjectStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

/* ──────────────────────────────── Types de sortie ─────────────────────────── */

export interface ServiceDTO {
  id: string;
  slug: string;
  title: string;
  eyebrow: string | null;
  excerpt: string;
  description: string;
  icon: string;
  coverImage: string | null;
  highlights: string[];
  deliverables: string[];
  processNote: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featured: boolean;
  published: boolean;
  order: number;
}

export interface ProjectDTO {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  location: string;
  city: string | null;
  country: string;
  year: number;
  area: number;
  budget: number | null;
  budgetLabel: string | null;
  clientName: string | null;
  excerpt: string;
  description: string;
  challenges: string | null;
  solution: string | null;
  features: string[];
  materials: string[];
  gallery: string[];
  beforeAfter: { before: string; after: string; label?: string }[] | null;
  coverImage: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  serviceId: string | null;
  testimonialId: string | null;
  featured: boolean;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  views: number;
  service?: { slug: string; title: string } | null;
  testimonial?: {
    authorName: string;
    authorRole: string | null;
    company: string | null;
    quote: string;
    rating: number;
    avatar: string | null;
  } | null;
}

export interface PostDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string | null;
  readMinutes: number;
  published: boolean;
  publishedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  views: number;
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  skills: string[];
  order: number;
}

export interface TestimonialDTO {
  id: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  avatar: string | null;
  rating: number;
  quote: string;
  order: number;
}

/**
 * Normalise les dates en chaînes ISO.
 *
 * L'API transporte les données en JSON (les Date deviennent alors des chaînes),
 * tandis que le rendu serveur manipule les objets Prisma bruts. Cette
 * normalisation garantit que les deux chemins produisent exactement la même
 * structure — condition indispensable à une hydratation sans divergence.
 */
function serializeDates<T>(value: T): T {
  if (value instanceof Date) return value.toISOString() as unknown as T;
  if (Array.isArray(value)) return value.map((v) => serializeDates(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = serializeDates(item);
    }
    return out as T;
  }
  return value;
}

/* ──────────────────────────────── Services ───────────────────────────────── */

export async function listServices(opts: { onlyPublished?: boolean } = {}) {
  const rows = await prisma.service.findMany({
    where: opts.onlyPublished === false ? undefined : { published: true },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
  });
  return serializeDates(rows) as ServiceDTO[];
}

export async function getServiceBySlug(slug: string): Promise<ServiceDTO | null> {
  const row = await prisma.service.findUnique({ where: { slug } });
  return serializeDates(row) as ServiceDTO | null;
}

/* ──────────────────────────────── Projets ───────────────────────────────── */

export interface ProjectFilters {
  category?: ProjectCategory | 'ALL';
  location?: string;
  year?: number;
  minArea?: number;
  maxArea?: number;
  maxBudget?: number;
  q?: string;
  featured?: boolean;
  status?: ProjectStatus;
  serviceId?: string;
  sort?: 'recent' | 'oldest' | 'area-desc' | 'area-asc' | 'budget-desc' | 'budget-asc' | 'title';
  limit?: number;
  offset?: number;
  onlyPublished?: boolean;
}

export function buildProjectWhere(filters: ProjectFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};
  // `onlyPublished === false` est réservé à l'espace d'administration : on
  // n'applique alors aucun filtre sur la publication.
  if (filters.onlyPublished !== false) where.published = true;

  if (filters.serviceId) where.serviceId = filters.serviceId;
  if (filters.category && filters.category !== 'ALL') where.category = filters.category;
  if (filters.status) where.status = filters.status;
  if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
  if (filters.year) where.year = filters.year;
  if (filters.featured !== undefined) where.featured = filters.featured;
  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    where.area = {
      ...(filters.minArea !== undefined ? { gte: filters.minArea } : {}),
      ...(filters.maxArea !== undefined ? { lte: filters.maxArea } : {}),
    };
  }
  if (filters.maxBudget !== undefined) where.budget = { lte: filters.maxBudget };
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { excerpt: { contains: filters.q, mode: 'insensitive' } },
      { location: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

function projectOrderBy(sort: ProjectFilters['sort']): Prisma.ProjectOrderByWithRelationInput[] {
  switch (sort) {
    case 'oldest':
      return [{ year: 'asc' }, { order: 'asc' }];
    case 'area-desc':
      return [{ area: 'desc' }];
    case 'area-asc':
      return [{ area: 'asc' }];
    case 'budget-desc':
      return [{ budget: 'desc' }];
    case 'budget-asc':
      return [{ budget: 'asc' }];
    case 'title':
      return [{ title: 'asc' }];
    case 'recent':
    default:
      return [{ year: 'desc' }, { order: 'asc' }];
  }
}

const projectInclude = {
  service: { select: { slug: true, title: true } },
  testimonial: {
    select: {
      authorName: true,
      authorRole: true,
      company: true,
      quote: true,
      rating: true,
      avatar: true,
    },
  },
} satisfies Prisma.ProjectInclude;

export async function listProjects(filters: ProjectFilters = {}) {
  const where = buildProjectWhere(filters);
  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: projectOrderBy(filters.sort),
      include: projectInclude,
      skip: filters.offset ?? 0,
      take: filters.limit ?? 24,
    }),
    prisma.project.count({ where }),
  ]);
  return { items: serializeDates(items) as unknown as ProjectDTO[], total };
}

export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  const row = await prisma.project.findUnique({ where: { slug }, include: projectInclude });
  return serializeDates(row) as unknown as ProjectDTO | null;
}

export async function getSimilarProjects(projectId: string, category: ProjectCategory, limit = 3) {
  const rows = await prisma.project.findMany({
    where: { published: true, id: { not: projectId }, category },
    orderBy: [{ year: 'desc' }],
    take: limit,
    include: projectInclude,
  });
  return serializeDates(rows) as unknown as ProjectDTO[];
}

export async function getProjectFilterFacets() {
  const [locations, years, categories, areas, budgets] = await Promise.all([
    prisma.project.findMany({
      where: { published: true },
      distinct: ['location'],
      select: { location: true },
      orderBy: { location: 'asc' },
    }),
    prisma.project.findMany({
      where: { published: true },
      distinct: ['year'],
      select: { year: true },
      orderBy: { year: 'desc' },
    }),
    prisma.project.groupBy({
      by: ['category'],
      where: { published: true },
      _count: { _all: true },
    }),
    prisma.project.aggregate({
      where: { published: true },
      _min: { area: true },
      _max: { area: true },
    }),
    prisma.project.aggregate({
      where: { published: true },
      _min: { budget: true },
      _max: { budget: true },
    }),
  ]);

  return {
    locations: locations.map((l) => l.location),
    years: years.map((y) => y.year),
    categories: categories.map((c) => ({ category: c.category, count: c._count._all })),
    areaRange: { min: areas._min.area ?? 0, max: areas._max.area ?? 0 },
    budgetRange: { min: budgets._min.budget ?? 0, max: budgets._max.budget ?? 0 },
  };
}

export async function incrementProjectView(id: string) {
  await prisma.project.update({ where: { id }, data: { views: { increment: 1 } } });
}

/* ──────────────────────────────── Blog ──────────────────────────────────── */

export async function listPosts(
  opts: { category?: string; q?: string; limit?: number; offset?: number; onlyPublished?: boolean } = {},
) {
  const where: Prisma.PostWhereInput = {};
  if (opts.onlyPublished !== false) where.published = true;
  if (opts.category && opts.category !== 'ALL') where.category = opts.category as PostCategory;
  if (opts.q) {
    where.OR = [
      { title: { contains: opts.q, mode: 'insensitive' } },
      { excerpt: { contains: opts.q, mode: 'insensitive' } },
      { content: { contains: opts.q, mode: 'insensitive' } },
      { tags: { has: opts.q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: opts.offset ?? 0,
      take: opts.limit ?? 12,
    }),
    prisma.post.count({ where }),
  ]);
  return { items: serializeDates(items) as unknown as PostDTO[], total };
}

export async function getPostBySlug(slug: string): Promise<PostDTO | null> {
  const row = await prisma.post.findUnique({ where: { slug } });
  return serializeDates(row) as unknown as PostDTO | null;
}

export async function getRelatedPosts(postId: string, category: string, limit = 3) {
  const rows = await prisma.post.findMany({
    where: { published: true, id: { not: postId }, category: category as PostCategory },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return serializeDates(rows) as unknown as PostDTO[];
}

export async function getPopularPosts(limit = 5) {
  const rows = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ views: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  });
  return serializeDates(rows) as unknown as PostDTO[];
}

/* ──────────────────────────────── Page « Le Cabinet » ───────────────────── */

export async function listTeamMembers() {
  const rows = await prisma.teamMember.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  return serializeDates(rows) as TeamMemberDTO[];
}

export async function listTestimonials() {
  const rows = await prisma.testimonial.findMany({ where: { published: true }, orderBy: { order: 'asc' } });
  return serializeDates(rows) as TestimonialDTO[];
}

export async function listCertifications() {
  return serializeDates(await prisma.certification.findMany({ orderBy: { order: 'asc' } }));
}

export async function listPartners() {
  return serializeDates(await prisma.partner.findMany({ orderBy: { order: 'asc' } }));
}

export async function listProcessSteps() {
  return serializeDates(await prisma.processStep.findMany({ orderBy: { order: 'asc' } }));
}

export async function listStats() {
  return serializeDates(await prisma.stat.findMany({ orderBy: { order: 'asc' } }));
}

export async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, serializeDates(r.value)])) as Record<string, unknown>;
}
