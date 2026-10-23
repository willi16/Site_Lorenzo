import type { ProjectCategory, ProjectStatus } from '@prisma/client';
import {
  getPopularPosts,
  getPostBySlug,
  getProjectBySlug,
  getProjectFilterFacets,
  getRelatedPosts,
  getServiceBySlug,
  getSimilarProjects,
  listCertifications,
  listPartners,
  listPosts,
  listProcessSteps,
  listProjects,
  listServices,
  listStats,
  listTeamMembers,
  listTestimonials,
} from '../modules/content/repository.js';
import { computeEstimate, FINISH_LEVELS, OPTIONS, TARIFFS } from '../modules/budget/tariffs.js';

/**
 * Implémentation « directe » de la source de données côté serveur.
 *
 * Elle interroge PostgreSQL via Prisma au lieu de passer par HTTP : le rendu
 * serveur ne subit donc pas la latence d'un aller-retour réseau, et le site
 * continue de fonctionner même si l'API est momentanément saturée.
 *
 * Le contrat est strictement identique à celui de l'implémentation HTTP côté
 * navigateur (cf. client/src/lib/data.ts).
 */
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

export interface DataSource {
  listServices(): Promise<ServiceDTO[]>;
  getService(slug: string): Promise<{ service: ServiceDTO; related: ProjectDTO[] } | null>;
  listProjects(query?: ProjectQuery): Promise<{ items: ProjectDTO[]; total: number }>;
  getProject(slug: string): Promise<{ project: ProjectDTO; similar: ProjectDTO[] } | null>;
  getProjectFacets(): Promise<unknown>;
  listPosts(query?: {
    category?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: PostDTO[]; total: number }>;
  getPost(slug: string): Promise<{ post: PostDTO; related: PostDTO[] } | null>;
  listTeam(): Promise<unknown[]>;
  listTestimonials(): Promise<unknown[]>;
  listCertifications(): Promise<unknown[]>;
  listPartners(): Promise<unknown[]>;
  listProcessSteps(): Promise<unknown[]>;
  listStats(): Promise<unknown[]>;
  getTariffs(): Promise<unknown>;
  estimateBudget(input: {
    projectType: string;
    area: number;
    finish: string;
    options: string[];
    includeFees: boolean;
  }): Promise<unknown>;
}

export const directDataSource: DataSource = {
  async listServices() {
    return listServices({ onlyPublished: true }) as Promise<ServiceDTO[]>;
  },

  async getService(slug) {
    const service = (await getServiceBySlug(slug)) as ServiceDTO | null;
    if (!service) return null;
    // Filtrage en base : le filtrage en mémoire après un `limit` global
    // renvoyait presque toujours une liste vide.
    const { items } = await listProjects({ serviceId: service.id, limit: 6, onlyPublished: true });
    const related = items as unknown as ProjectDTO[];
    return { service, related };
  },

  async listProjects(query = {}) {
    const result = await listProjects({ ...query, onlyPublished: true });
    return { items: result.items as unknown as ProjectDTO[], total: result.total };
  },

  async getProject(slug) {
    const project = (await getProjectBySlug(slug)) as unknown as ProjectDTO | null;
    if (!project) return null;
    const similar = (await getSimilarProjects(
      project.id,
      project.category,
      3,
    )) as unknown as ProjectDTO[];
    return { project, similar };
  },

  async getProjectFacets() {
    return getProjectFilterFacets();
  },

  async listPosts(query = {}) {
    const result = await listPosts({ ...query, onlyPublished: true });
    return { items: result.items as unknown as PostDTO[], total: result.total };
  },

  async getPost(slug) {
    const post = (await getPostBySlug(slug)) as unknown as PostDTO | null;
    if (!post) return null;
    const related = (await getRelatedPosts(
      post.id,
      post.category,
      3,
    )) as unknown as PostDTO[];
    return { post, related };
  },

  async listTeam() {
    return listTeamMembers();
  },

  async listTestimonials() {
    return listTestimonials();
  },

  async listCertifications() {
    return listCertifications();
  },

  async listPartners() {
    return listPartners();
  },

  async listProcessSteps() {
    return listProcessSteps();
  },

  async listStats() {
    return listStats();
  },

  async getTariffs() {
    return {
      tariffs: Object.entries(TARIFFS).map(([key, t]) => ({ key, ...t })),
      finishes: Object.entries(FINISH_LEVELS).map(([key, f]) => ({ key, ...f })),
      options: Object.entries(OPTIONS).map(([key, o]) => ({ key, ...o })),
    };
  },

  async estimateBudget(input) {
    return computeEstimate({
      projectType: input.projectType as 'RESIDENTIAL',
      area: input.area,
      finish: input.finish as 'STANDARD',
      options: input.options as never,
      includeFees: input.includeFees,
    });
  },
};

export { getPopularPosts };
