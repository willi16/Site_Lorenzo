import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { param } from '../../lib/http.js';
import {
  getPostBySlug,
  getPopularPosts,
  getProjectBySlug,
  getProjectFilterFacets,
  getRelatedPosts,
  getServiceBySlug,
  getSimilarProjects,
  incrementProjectView,
  listCertifications,
  listPartners,
  listPosts,
  listProcessSteps,
  listProjects,
  listServices,
  listStats,
  listTeamMembers,
  listTestimonials,
} from './repository.js';

const router = Router();

/* ────────────────────────────────── Services ─────────────────────────────── */

/**
 * Liste publique des services : uniquement les services publiés.
 *
 * Le paramètre `?published=false` a été retiré : la route étant publique et non
 * authentifiée, il exposait les brouillons du cabinet à n'importe quel
 * visiteur. Les brouillons restent accessibles via l'espace d'administration
 * (`/api/admin/content/services?status=draft`).
 */
router.get('/services', async (_req, res) => {
  res.json({ ok: true, data: await listServices({ onlyPublished: true }) });
});

router.get(
  '/services/:slug',
  validate({ params: z.object({ slug: z.string().min(1).max(120) }) }),
  async (req, res) => {
    const service = await getServiceBySlug(param(req, 'slug'));
    if (!service) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Service introuvable' } });
      return;
    }
    // Filtrage côté base : récupérer les 6 derniers projets puis les filtrer
    // retournait presque toujours une liste vide.
    const { items: related } = await listProjects({
      serviceId: service.id,
      onlyPublished: true,
      limit: 6,
    });
    res.json({ ok: true, data: { service, related } });
  },
);

/* ────────────────────────────────── Projets ──────────────────────────────── */

const projectQuery = z.object({
  category: z.enum(['ALL', 'RESIDENTIAL', 'COMMERCIAL', 'RENOVATION', 'INTERIOR', 'EXTERIOR']).optional(),
  location: z.string().max(120).optional(),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  minArea: z.coerce.number().min(0).optional(),
  maxArea: z.coerce.number().min(0).optional(),
  maxBudget: z.coerce.number().min(0).optional(),
  q: z.string().max(120).optional(),
  featured: z.enum(['true', 'false']).optional(),
  sort: z
    .enum(['recent', 'oldest', 'area-desc', 'area-asc', 'budget-desc', 'budget-asc', 'title'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
  offset: z.coerce.number().int().min(0).max(100_000).optional(),
});

router.get('/projects', validate({ query: projectQuery }), async (req, res) => {
  const q = req.query as z.infer<typeof projectQuery>;
  const result = await listProjects({
    ...q,
    featured: q.featured === undefined ? undefined : q.featured === 'true',
  });
  res.json({ ok: true, data: result.items, meta: { total: result.total } });
});

router.get('/projects/filters', async (_req, res) => {
  res.json({ ok: true, data: await getProjectFilterFacets() });
});

router.get(
  '/projects/:slug',
  validate({ params: z.object({ slug: z.string().min(1).max(160) }) }),
  async (req, res) => {
    const project = await getProjectBySlug(param(req, 'slug'));
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Projet introuvable' } });
      return;
    }
    void incrementProjectView(project.id);
    const similar = await getSimilarProjects(project.id, project.category, 3);
    res.json({ ok: true, data: { project, similar } });
  },
);

/* ─────────────────────────────────── Blog ────────────────────────────────── */

const postQuery = z.object({
  category: z.string().max(40).optional(),
  q: z.string().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).max(100_000).optional(),
});

router.get('/posts', validate({ query: postQuery }), async (req, res) => {
  const q = req.query as z.infer<typeof postQuery>;
  const result = await listPosts(q);
  res.json({ ok: true, data: result.items, meta: { total: result.total } });
});

router.get('/posts/popular', async (_req, res) => {
  res.json({ ok: true, data: await getPopularPosts(5) });
});

router.get(
  '/posts/:slug',
  validate({ params: z.object({ slug: z.string().min(1).max(160) }) }),
  async (req, res) => {
    const post = await getPostBySlug(param(req, 'slug'));
    if (!post) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Article introuvable' } });
      return;
    }
    const related = await getRelatedPosts(post.id, post.category, 3);
    res.json({ ok: true, data: { post, related } });
  },
);

/* ────────────────────────────── Contenu institutionnel ──────────────────── */

router.get('/team', async (_req, res) => {
  res.json({ ok: true, data: await listTeamMembers() });
});

router.get('/testimonials', async (_req, res) => {
  res.json({ ok: true, data: await listTestimonials() });
});

router.get('/certifications', async (_req, res) => {
  res.json({ ok: true, data: await listCertifications() });
});

router.get('/partners', async (_req, res) => {
  res.json({ ok: true, data: await listPartners() });
});

router.get('/process', async (_req, res) => {
  res.json({ ok: true, data: await listProcessSteps() });
});

router.get('/stats', async (_req, res) => {
  res.json({ ok: true, data: await listStats() });
});

export default router;
