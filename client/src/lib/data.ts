/* ────────────────────────────── Contrats de données ──────────────────────────
 * Ces types décrivent le contrat public de l'API. Le serveur les implémente
 * via Prisma ; le navigateur via HTTP. Les deux implémentations sont
 * interchangeables : le rendu serveur (SSR) et le rendu client (CSR) obtiennent
 * exactement les mêmes structures.
 * ────────────────────────────────────────────────────────────────────────── */

export type ProjectCategory =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'RENOVATION'
  | 'INTERIOR'
  | 'EXTERIOR';

export type ProjectStatus = 'CONCEPT' | 'IN_PROGRESS' | 'COMPLETED';

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

export interface CertificationDTO {
  id: string;
  title: string;
  issuer: string;
  year: string | null;
  logo: string | null;
  description: string | null;
  order: number;
}

export interface PartnerDTO {
  id: string;
  name: string;
  type: string;
  logo: string | null;
  website: string | null;
  order: number;
}

export interface ProcessStepDTO {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  duration: string | null;
  order: number;
}

export interface StatDTO {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  icon: string | null;
  order: number;
}

export interface ProjectFacets {
  locations: string[];
  years: number[];
  categories: { category: ProjectCategory; count: number }[];
  areaRange: { min: number; max: number };
  budgetRange: { min: number; max: number };
}

export interface ProjectQuery {
  category?: ProjectCategory | 'ALL';
  location?: string;
  year?: number;
  minArea?: number;
  maxArea?: number;
  maxBudget?: number;
  q?: string;
  featured?: boolean;
  sort?: 'recent' | 'oldest' | 'area-desc' | 'area-asc' | 'budget-desc' | 'budget-asc' | 'title';
  limit?: number;
  offset?: number;
}

export interface BudgetEstimate {
  projectType: string;
  projectTypeLabel: string;
  area: number;
  finish: string;
  finishLabel: string;
  unitPrice: { min: number; max: number };
  options: { label: string; amount: number }[];
  estimate: {
    min: number;
    max: number;
    minFormatted: string;
    maxFormatted: string;
    perSquareMeter: number;
    perSquareMeterFormatted: string;
  };
  leadTime: string;
  disclaimer: string;
}

export interface TariffCatalog {
  tariffs: { key: string; label: string; min: number; max: number; base: number; lead: string }[];
  finishes: { key: string; label: string; factor: number; note: string }[];
  options: { key: string; label: string; factor: number; flat: number }[];
}

/**
 * Source de données. Deux implémentations interchangeables :
 *  - `httpDataSource`  : requêtes HTTP vers /api (navigateur)
 *  - `directDataSource` : accès direct à PostgreSQL (rendu serveur)
 */
export interface DataSource {
  listServices(): Promise<ServiceDTO[]>;
  getService(slug: string): Promise<{ service: ServiceDTO; related: ProjectDTO[] } | null>;
  listProjects(query?: ProjectQuery): Promise<{ items: ProjectDTO[]; total: number }>;
  getProject(slug: string): Promise<{ project: ProjectDTO; similar: ProjectDTO[] } | null>;
  getProjectFacets(): Promise<ProjectFacets>;
  listPosts(query?: {
    category?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: PostDTO[]; total: number }>;
  getPost(slug: string): Promise<{ post: PostDTO; related: PostDTO[] } | null>;
  listTeam(): Promise<TeamMemberDTO[]>;
  listTestimonials(): Promise<TestimonialDTO[]>;
  listCertifications(): Promise<CertificationDTO[]>;
  listPartners(): Promise<PartnerDTO[]>;
  listProcessSteps(): Promise<ProcessStepDTO[]>;
  listStats(): Promise<StatDTO[]>;
  getTariffs(): Promise<TariffCatalog>;
  estimateBudget(input: {
    projectType: string;
    area: number;
    finish: string;
    options: string[];
    includeFees: boolean;
  }): Promise<BudgetEstimate>;
}

/* ─────────────────────────────── Implémentation HTTP ─────────────────────── */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const csrf = getCsrfToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
      ...init?.headers,
    },
  });

  const contentType = res.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.error?.code ?? 'UNKNOWN',
      payload?.error?.message ?? `Erreur ${res.status}`,
      payload?.error?.details,
    );
  }
  return payload?.data as T;
}

/** Jeton CSRF double-submit : lu dans le cookie, renvoyé dans l'en-tête. */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)ba_csrf=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

export async function ensureCsrfToken(): Promise<string> {
  const existing = getCsrfToken();
  if (existing) return existing;
  await request<{ token: string }>('/csrf');
  return getCsrfToken();
}

function toQueryString(query: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (value === undefined || value === null || value === '' || value === 'ALL') continue;
    params.set(key, String(value));
  }
  const str = params.toString();
  return str ? `?${str}` : '';
}

export const httpDataSource: DataSource = {
  async listServices() {
    return request<ServiceDTO[]>('/services');
  },
  async getService(slug) {
    return request<{ service: ServiceDTO; related: ProjectDTO[] } | null>(`/services/${slug}`);
  },
  async listProjects(query = {}) {
    const res = await fetch(`${API_BASE}/projects${toQueryString(query)}`, { credentials: 'same-origin' });
    const payload = await res.json();
    if (!res.ok) throw new ApiError(res.status, payload?.error?.code ?? 'UNKNOWN', payload?.error?.message);
    return { items: payload.data as ProjectDTO[], total: payload.meta?.total ?? 0 };
  },
  async getProject(slug) {
    return request<{ project: ProjectDTO; similar: ProjectDTO[] } | null>(`/projects/${slug}`);
  },
  async getProjectFacets() {
    return request<ProjectFacets>('/projects/filters');
  },
  async listPosts(query = {}) {
    const res = await fetch(`${API_BASE}/posts${toQueryString(query)}`, { credentials: 'same-origin' });
    const payload = await res.json();
    if (!res.ok) throw new ApiError(res.status, payload?.error?.code ?? 'UNKNOWN', payload?.error?.message);
    return { items: payload.data as PostDTO[], total: payload.meta?.total ?? 0 };
  },
  async getPost(slug) {
    return request<{ post: PostDTO; related: PostDTO[] } | null>(`/posts/${slug}`);
  },
  async listTeam() {
    return request<TeamMemberDTO[]>('/team');
  },
  async listTestimonials() {
    return request<TestimonialDTO[]>('/testimonials');
  },
  async listCertifications() {
    return request<CertificationDTO[]>('/certifications');
  },
  async listPartners() {
    return request<PartnerDTO[]>('/partners');
  },
  async listProcessSteps() {
    return request<ProcessStepDTO[]>('/process');
  },
  async listStats() {
    return request<StatDTO[]>('/stats');
  },
  async getTariffs() {
    return request<TariffCatalog>('/budget/tariffs');
  },
  async estimateBudget(input) {
    return request<BudgetEstimate>('/budget/estimate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

/* ───────────────────────────── Sélection de la source ────────────────────── */

let activeSource: DataSource = httpDataSource;

/** Permet au serveur d'injecter sa source directe (accès base sans HTTP). */
export function setDataSource(source: DataSource): void {
  activeSource = source;
}

export function getDataSource(): DataSource {
  return activeSource;
}
