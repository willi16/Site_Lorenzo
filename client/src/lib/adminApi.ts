/**
 * Client de l'espace d'administration.
 *
 * L'authentification repose sur deux cookies httpOnly (access + refresh).
 * L'access token est court (15 min) : dès qu'un appel renvoie 401, on
 * déclenche un refresh (avec rotation côté serveur) puis on rejoue la requête.
 */

import { ensureCsrfToken, getCsrfToken } from '@/lib/data';

const API = '/api';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** En-têtes CSRF pour les requêtes mutantes (double submit cookie). */
async function csrfHeaders(init?: RequestInit): Promise<Record<string, string>> {
  const method = (init?.method ?? 'GET').toUpperCase();
  if (!UNSAFE_METHODS.has(method)) return {};
  let token = getCsrfToken();
  if (!token) {
    await ensureCsrfToken();
    token = getCsrfToken();
  }
  return token ? { 'X-CSRF-Token': token } : {};
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

async function parse(res: Response) {
  const contentType = res.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? res.json() : null;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const csrf = await csrfHeaders({ method: 'POST' });
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...csrf },
    credentials: 'same-origin',
    body: JSON.stringify({ email, password }),
  });
  const payload = await parse(res);
  if (!res.ok) throw new AdminAuthError(payload?.error?.message ?? 'Connexion impossible');
  return payload.data.user as AdminUser;
}

export async function logout(): Promise<void> {
  const csrf = await csrfHeaders({ method: 'POST' }).catch(() => ({}) as Record<string, string>);
  await fetch(`${API}/auth/logout`, {
    method: 'POST',
    headers: csrf,
    credentials: 'same-origin',
  }).catch(() => undefined);
}

export async function currentUser(): Promise<AdminUser | null> {
  const res = await fetch(`${API}/auth/me`, { credentials: 'same-origin' });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const payload = await parse(res);
  return (payload?.data ?? null) as AdminUser | null;
}

let refreshing: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = csrfHeaders({ method: 'POST' })
      .then((csrf) =>
        fetch(`${API}/auth/refresh`, {
          method: 'POST',
          headers: csrf,
          credentials: 'same-origin',
        }),
      )
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const send = async () => {
    const csrf = await csrfHeaders(init);
    return fetch(`${API}${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: {
        ...(init?.body && !(init.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...csrf,
        ...init?.headers,
      },
    });
  };

  let res = await send();
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) res = await send();
  }

  const payload = await parse(res);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new AdminAuthError(payload?.error?.message ?? 'Session expirée');
    }
    throw new Error(payload?.error?.message ?? `Erreur ${res.status}`);
  }
  return payload?.data as T;
}

export interface DashboardData {
  leads: { total: number; last30Days: number; qualified: number; won: number; conversion: number };
  newsletter: { total: number; active: number };
  appointments: { total: number; pending: number };
  content: {
    projects: { total: number; published: number };
    posts: { total: number; published: number };
    views: number;
  };
  recentLeads: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    projectType: string;
    status: string;
    createdAt: string;
  }[];
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectType: string;
  area: string | null;
  budget: string | null;
  location: string;
  description: string;
  contactPreference: string;
  status: 'NEW' | 'IN_PROGRESS' | 'QUALIFIED' | 'WON' | 'LOST';
  attachments: string[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  slot: string;
  duration: number;
  subject: string | null;
  notes: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  ip: string | null;
  createdAt: string;
  user: { email: string; name: string } | null;
}

export const LEAD_STATUS_LABELS: Record<Lead['status'], string> = {
  NEW: 'Nouveau',
  IN_PROGRESS: 'En cours',
  QUALIFIED: 'Qualifié',
  WON: 'Gagné',
  LOST: 'Perdu',
};

export const APPOINTMENT_STATUS_LABELS: Record<Appointment['status'], string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
};

/* ───────────────────────── Contenu éditorial ───────────────────────── */

export type ContentEntity = 'posts' | 'projects' | 'services' | 'testimonials' | 'team';

export type PostCategory =
  | 'CONSEILS'
  | 'TENDANCES'
  | 'PROJETS'
  | 'REGLEMENTATION'
  | 'DURABLE'
  | 'MATERIAUX';

export type ProjectCategory =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'RENOVATION'
  | 'INTERIOR'
  | 'EXTERIOR';

export type ProjectStatus = 'CONCEPT' | 'IN_PROGRESS' | 'COMPLETED';

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  CONSEILS: 'Conseils',
  TENDANCES: 'Tendances',
  PROJETS: 'Projets',
  REGLEMENTATION: 'Réglementation',
  DURABLE: 'Durable',
  MATERIAUX: 'Matériaux',
};

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  RESIDENTIAL: 'Résidentiel',
  COMMERCIAL: 'Commercial',
  RENOVATION: 'Rénovation',
  INTERIOR: 'Intérieur',
  EXTERIOR: 'Extérieur',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  CONCEPT: 'Conception',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Livré',
};

/** Champs communs aux enregistrements éditoriaux. */
interface ContentBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPost extends ContentBase {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: PostCategory;
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

export interface AdminProject extends ContentBase {
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
  coverImage: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  serviceId: string | null;
  testimonialId: string | null;
  featured: boolean;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  order: number;
  views: number;
  service?: { id: string; title: string } | null;
}

export interface AdminService extends ContentBase {
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

export interface AdminTestimonial extends ContentBase {
  authorName: string;
  authorRole: string | null;
  company: string | null;
  quote: string;
  rating: number;
  avatar: string | null;
  published: boolean;
  order: number;
}

export interface AdminTeamMember extends ContentBase {
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  skills: string[];
  order: number;
  active: boolean;
}

export type AdminContentItem =
  | AdminPost
  | AdminProject
  | AdminService
  | AdminTestimonial
  | AdminTeamMember;

export interface ContentList {
  items: AdminContentItem[];
  total: number;
}

export interface ContentOptions {
  services: { id: string; title: string }[];
  testimonials: { id: string; authorName: string; company: string | null }[];
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string | null;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
}

/** Liste les enregistrements d'un type de contenu (filtres optionnels). */
export function listContent(
  entity: ContentEntity,
  params?: { status?: 'published' | 'draft'; q?: string },
): Promise<ContentList> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.q && params.q.trim().length >= 2) search.set('q', params.q.trim());
  const qs = search.toString();
  return adminRequest<ContentList>(`/admin/content/${entity}${qs ? `?${qs}` : ''}`);
}

export function getContent<T = AdminContentItem>(
  entity: ContentEntity,
  id: string,
): Promise<T> {
  return adminRequest<T>(`/admin/content/${entity}/${id}`);
}

export function createContent<T = AdminContentItem>(
  entity: ContentEntity,
  body: Record<string, unknown>,
): Promise<T> {
  return adminRequest<T>(`/admin/content/${entity}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateContent<T = AdminContentItem>(
  entity: ContentEntity,
  id: string,
  body: Record<string, unknown>,
): Promise<T> {
  return adminRequest<T>(`/admin/content/${entity}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteContent(entity: ContentEntity, id: string): Promise<{ id: string }> {
  return adminRequest<{ id: string }>(`/admin/content/${entity}/${id}`, { method: 'DELETE' });
}

export function getContentOptions(): Promise<ContentOptions> {
  return adminRequest<ContentOptions>('/admin/content/options');
}

/**
 * Envoie une image au serveur et renvoie l'URL publique à stocker dans un
 * champ image (`/uploads/<fichier>`).
 */
export async function uploadImage(file: File, alt?: string): Promise<string> {
  const form = new FormData();
  form.append('files', file);
  if (alt) form.append('alt', alt);
  const media = await adminRequest<MediaItem[]>('/uploads', { method: 'POST', body: form });
  const first = media[0];
  if (!first?.url) throw new Error("Le serveur n'a renvoyé aucune URL pour l'image.");
  return first.url;
}

