import { Router } from 'express';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { param } from '../../lib/http.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { slugify, uniqueSlug } from '../../lib/slug.js';
import {
  postCreateSchema,
  postUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  teamCreateSchema,
  teamUpdateSchema,
  testimonialCreateSchema,
  testimonialUpdateSchema,
} from './content.schemas.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'EDITOR'));

/** Écrit une entrée d'audit sans jamais faire échouer la requête métier. */
async function audit(
  req: Request,
  action: string,
  entity: string,
  entityId: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ?? null,
        action,
        entity,
        entityId,
        meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
        ip: req.ip ?? null,
        userAgent: req.get('user-agent') ?? null,
      },
    });
  } catch {
    /* le journal d'audit ne doit pas bloquer l'édition */
  }
}

function statusFilter(status: unknown): { published?: boolean } {
  if (status === 'published') return { published: true };
  if (status === 'draft') return { published: false };
  return {};
}

function searchFilter(q: unknown, fields: string[]): Prisma.PostWhereInput | Prisma.ProjectWhereInput | Prisma.ServiceWhereInput | Record<string, never> {
  if (typeof q !== 'string' || q.trim().length < 2) return {};
  const value = q.trim();
  return {
    OR: fields.map((field) => ({ [field]: { contains: value, mode: 'insensitive' } })),
  } as Prisma.PostWhereInput;
}

const trimmed = (value: string | undefined | null): string | null => (value ? value : null);

/* ─────────────────────────────── Articles ───────────────────────────────── */

router.get('/posts', async (req, res) => {
  const where = {
    ...statusFilter(req.query.status),
    ...searchFilter(req.query.q, ['title', 'excerpt', 'slug']),
  } as Prisma.PostWhereInput;

  const [items, total] = await Promise.all([
    prisma.post.findMany({ where, orderBy: [{ updatedAt: 'desc' }] }),
    prisma.post.count({ where }),
  ]);

  res.json({ ok: true, data: { items, total } });
});

router.get('/posts/:id', async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: param(req, 'id') } });
  if (!post) throw notFound('Article introuvable.');
  res.json({ ok: true, data: post });
});

router.post('/posts', validate({ body: postCreateSchema }), async (req, res) => {
  const body = req.body as typeof postCreateSchema._output;
  const slug = await uniqueSlug(
    async (candidate) => (await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } })) !== null,
    body.slug ?? body.title,
  );

  const post = await prisma.post.create({
    data: {
      slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: trimmed(body.coverImage),
      category: body.category,
      tags: body.tags ?? [],
      authorName: body.authorName,
      authorRole: trimmed(body.authorRole),
      readMinutes: body.readMinutes,
      published: body.published ?? true,
      publishedAt: body.publishedAt ?? new Date(),
      seoTitle: trimmed(body.seoTitle),
      seoDescription: trimmed(body.seoDescription),
    },
  });

  await audit(req, 'post.create', 'Post', post.id, { title: post.title, slug: post.slug });
  res.status(201).json({ ok: true, data: post });
});

router.patch('/posts/:id', validate({ body: postUpdateSchema }), async (req, res) => {
  const id = param(req, 'id');
  const body = req.body as typeof postUpdateSchema._output;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw notFound('Article introuvable.');

  const data: Prisma.PostUncheckedUpdateInput = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.content !== undefined) data.content = body.content;
  if (body.coverImage !== undefined) data.coverImage = trimmed(body.coverImage);
  if (body.category !== undefined) data.category = body.category;
  if (body.tags !== undefined) data.tags = body.tags;
  if (body.authorName !== undefined) data.authorName = body.authorName;
  if (body.authorRole !== undefined) data.authorRole = trimmed(body.authorRole);
  if (body.readMinutes !== undefined) data.readMinutes = body.readMinutes;
  if (body.seoTitle !== undefined) data.seoTitle = trimmed(body.seoTitle);
  if (body.seoDescription !== undefined) data.seoDescription = trimmed(body.seoDescription);

  if (body.slug !== undefined || body.title !== undefined) {
    const desired = body.slug ?? tislug(body.title, existing.title);
    if (desired !== existing.slug) {
      data.slug = await uniqueSlug(
        async (candidate) =>
          (await prisma.post.findFirst({ where: { slug: candidate, NOT: { id } }, select: { id: true } })) !== null,
        desired,
      );
    }
  }

  if (body.published !== undefined) {
    data.published = body.published;
    if (body.published && !existing.published) {
      data.publishedAt = body.publishedAt ?? new Date();
    }
  }
  if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt;

  const post = await prisma.post.update({ where: { id }, data });
  await audit(req, 'post.update', 'Post', post.id, { title: post.title, published: post.published });
  res.json({ ok: true, data: post });
});

router.delete('/posts/:id', async (req, res) => {
  const id = param(req, 'id');
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw notFound('Article introuvable.');
  await prisma.post.delete({ where: { id } });
  await audit(req, 'post.delete', 'Post', id, { title: post.title });
  res.json({ ok: true, data: { id } });
});

/* ────────────────────────────── Réalisations ────────────────────────────── */

router.get('/projects', async (req, res) => {
  const where = {
    ...statusFilter(req.query.status),
    ...searchFilter(req.query.q, ['title', 'location', 'city', 'slug']),
  } as Prisma.ProjectWhereInput;

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      include: { service: { select: { id: true, title: true } } },
    }),
    prisma.project.count({ where }),
  ]);

  res.json({ ok: true, data: { items, total } });
});

router.get('/projects/:id', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: param(req, 'id') } });
  if (!project) throw notFound('Réalisation introuvable.');
  res.json({ ok: true, data: project });
});

async function assertRelations(serviceId?: string, testimonialId?: string): Promise<void> {
  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } });
    if (!service) throw badRequest('Service associé introuvable.');
  }
  if (testimonialId) {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
      select: { id: true },
    });
    if (!testimonial) throw badRequest('Témoignage associé introuvable.');
  }
}

router.post('/projects', validate({ body: projectCreateSchema }), async (req, res) => {
  const body = req.body as typeof projectCreateSchema._output;
  const serviceId = trimmed(body.serviceId);
  const testimonialId = trimmed(body.testimonialId);
  await assertRelations(serviceId ?? undefined, testimonialId ?? undefined);

  const slug = await uniqueSlug(
    async (candidate) =>
      (await prisma.project.findUnique({ where: { slug: candidate }, select: { id: true } })) !== null,
    body.slug ?? body.title,
  );

  const project = await prisma.project.create({
    data: {
      slug,
      title: body.title,
      subtitle: trimmed(body.subtitle),
      category: body.category,
      status: body.status,
      location: body.location,
      city: trimmed(body.city),
      country: body.country,
      year: body.year,
      area: body.area,
      budget: typeof body.budget === 'number' ? body.budget : null,
      budgetLabel: trimmed(body.budgetLabel),
      clientName: trimmed(body.clientName),
      excerpt: body.excerpt,
      description: body.description,
      challenges: trimmed(body.challenges),
      solution: trimmed(body.solution),
      features: body.features ?? [],
      materials: body.materials ?? [],
      gallery: body.gallery ?? [],
      coverImage: trimmed(body.coverImage),
      videoUrl: trimmed(body.videoUrl),
      virtualTourUrl: trimmed(body.virtualTourUrl),
      serviceId,
      testimonialId,
      featured: body.featured ?? false,
      published: body.published ?? true,
      seoTitle: trimmed(body.seoTitle),
      seoDescription: trimmed(body.seoDescription),
      order: body.order,
    },
  });

  await audit(req, 'project.create', 'Project', project.id, { title: project.title, slug: project.slug });
  res.status(201).json({ ok: true, data: project });
});

router.patch('/projects/:id', validate({ body: projectUpdateSchema }), async (req, res) => {
  const id = param(req, 'id');
  const body = req.body as typeof projectUpdateSchema._output;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw notFound('Réalisation introuvable.');

  if (body.serviceId !== undefined || body.testimonialId !== undefined) {
    await assertRelations(
      body.serviceId ? body.serviceId : undefined,
      body.testimonialId ? body.testimonialId : undefined,
    );
  }

  const data: Prisma.ProjectUncheckedUpdateInput = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.subtitle !== undefined) data.subtitle = trimmed(body.subtitle);
  if (body.category !== undefined) data.category = body.category;
  if (body.status !== undefined) data.status = body.status;
  if (body.location !== undefined) data.location = body.location;
  if (body.city !== undefined) data.city = trimmed(body.city);
  if (body.country !== undefined) data.country = body.country;
  if (body.year !== undefined) data.year = body.year;
  if (body.area !== undefined) data.area = body.area;
  if (body.budget !== undefined) data.budget = typeof body.budget === 'number' ? body.budget : null;
  if (body.budgetLabel !== undefined) data.budgetLabel = trimmed(body.budgetLabel);
  if (body.clientName !== undefined) data.clientName = trimmed(body.clientName);
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.description !== undefined) data.description = body.description;
  if (body.challenges !== undefined) data.challenges = trimmed(body.challenges);
  if (body.solution !== undefined) data.solution = trimmed(body.solution);
  if (body.features !== undefined) data.features = body.features;
  if (body.materials !== undefined) data.materials = body.materials;
  if (body.gallery !== undefined) data.gallery = body.gallery;
  if (body.coverImage !== undefined) data.coverImage = trimmed(body.coverImage);
  if (body.videoUrl !== undefined) data.videoUrl = trimmed(body.videoUrl);
  if (body.virtualTourUrl !== undefined) data.virtualTourUrl = trimmed(body.virtualTourUrl);
  if (body.serviceId !== undefined) data.serviceId = trimmed(body.serviceId);
  if (body.testimonialId !== undefined) data.testimonialId = trimmed(body.testimonialId);
  if (body.featured !== undefined) data.featured = body.featured;
  if (body.published !== undefined) data.published = body.published;
  if (body.seoTitle !== undefined) data.seoTitle = trimmed(body.seoTitle);
  if (body.seoDescription !== undefined) data.seoDescription = trimmed(body.seoDescription);
  if (body.order !== undefined) data.order = body.order;

  if (body.slug !== undefined || body.title !== undefined) {
    const desired = body.slug ?? tislug(body.title, existing.title);
    if (desired !== existing.slug) {
      data.slug = await uniqueSlug(
        async (candidate) =>
          (await prisma.project.findFirst({ where: { slug: candidate, NOT: { id } }, select: { id: true } })) !==
          null,
        desired,
      );
    }
  }

  const project = await prisma.project.update({ where: { id }, data });
  await audit(req, 'project.update', 'Project', project.id, {
    title: project.title,
    published: project.published,
  });
  res.json({ ok: true, data: project });
});

router.delete('/projects/:id', async (req, res) => {
  const id = param(req, 'id');
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw notFound('Réalisation introuvable.');
  await prisma.project.delete({ where: { id } });
  await audit(req, 'project.delete', 'Project', id, { title: project.title });
  res.json({ ok: true, data: { id } });
});

/* ──────────────────────────────── Services ──────────────────────────────── */

router.get('/services', async (req, res) => {
  const where = {
    ...statusFilter(req.query.status),
    ...searchFilter(req.query.q, ['title', 'excerpt', 'slug']),
  } as Prisma.ServiceWhereInput;

  const [items, total] = await Promise.all([
    prisma.service.findMany({ where, orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.service.count({ where }),
  ]);

  res.json({ ok: true, data: { items, total } });
});

router.get('/services/:id', async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: param(req, 'id') } });
  if (!service) throw notFound('Service introuvable.');
  res.json({ ok: true, data: service });
});

router.post('/services', validate({ body: serviceCreateSchema }), async (req, res) => {
  const body = req.body as typeof serviceCreateSchema._output;
  const slug = await uniqueSlug(
    async (candidate) =>
      (await prisma.service.findUnique({ where: { slug: candidate }, select: { id: true } })) !== null,
    body.slug ?? body.title,
  );

  const service = await prisma.service.create({
    data: {
      slug,
      title: body.title,
      eyebrow: trimmed(body.eyebrow),
      excerpt: body.excerpt,
      description: body.description,
      icon: body.icon,
      coverImage: trimmed(body.coverImage),
      highlights: body.highlights ?? [],
      deliverables: body.deliverables ?? [],
      processNote: trimmed(body.processNote),
      seoTitle: trimmed(body.seoTitle),
      seoDescription: trimmed(body.seoDescription),
      featured: body.featured ?? false,
      published: body.published ?? true,
      order: body.order,
    },
  });

  await audit(req, 'service.create', 'Service', service.id, { title: service.title, slug: service.slug });
  res.status(201).json({ ok: true, data: service });
});

router.patch('/services/:id', validate({ body: serviceUpdateSchema }), async (req, res) => {
  const id = param(req, 'id');
  const body = req.body as typeof serviceUpdateSchema._output;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) throw notFound('Service introuvable.');

  const data: Prisma.ServiceUncheckedUpdateInput = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.eyebrow !== undefined) data.eyebrow = trimmed(body.eyebrow);
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.description !== undefined) data.description = body.description;
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.coverImage !== undefined) data.coverImage = trimmed(body.coverImage);
  if (body.highlights !== undefined) data.highlights = body.highlights;
  if (body.deliverables !== undefined) data.deliverables = body.deliverables;
  if (body.processNote !== undefined) data.processNote = trimmed(body.processNote);
  if (body.seoTitle !== undefined) data.seoTitle = trimmed(body.seoTitle);
  if (body.seoDescription !== undefined) data.seoDescription = trimmed(body.seoDescription);
  if (body.featured !== undefined) data.featured = body.featured;
  if (body.published !== undefined) data.published = body.published;
  if (body.order !== undefined) data.order = body.order;

  if (body.slug !== undefined || body.title !== undefined) {
    const desired = body.slug ?? tislug(body.title, existing.title);
    if (desired !== existing.slug) {
      data.slug = await uniqueSlug(
        async (candidate) =>
          (await prisma.service.findFirst({ where: { slug: candidate, NOT: { id } }, select: { id: true } })) !==
          null,
        desired,
      );
    }
  }

  const service = await prisma.service.update({ where: { id }, data });
  await audit(req, 'service.update', 'Service', service.id, {
    title: service.title,
    published: service.published,
  });
  res.json({ ok: true, data: service });
});

router.delete('/services/:id', async (req, res) => {
  const id = param(req, 'id');
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw notFound('Service introuvable.');
  await prisma.service.delete({ where: { id } });
  await audit(req, 'service.delete', 'Service', id, { title: service.title });
  res.json({ ok: true, data: { id } });
});

/* ────────────────────────────── Témoignages ─────────────────────────────── */

router.get('/testimonials', async (_req, res) => {
  const items = await prisma.testimonial.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  res.json({ ok: true, data: { items, total: items.length } });
});

router.get('/testimonials/:id', async (req, res) => {
  const item = await prisma.testimonial.findUnique({ where: { id: param(req, 'id') } });
  if (!item) throw notFound('Témoignage introuvable.');
  res.json({ ok: true, data: item });
});

router.post('/testimonials', validate({ body: testimonialCreateSchema }), async (req, res) => {
  const body = req.body as typeof testimonialCreateSchema._output;
  const item = await prisma.testimonial.create({
    data: {
      authorName: body.authorName,
      authorRole: trimmed(body.authorRole),
      company: trimmed(body.company),
      quote: body.quote,
      rating: body.rating,
      avatar: trimmed(body.avatar),
      published: body.published ?? true,
      order: body.order,
    },
  });
  await audit(req, 'testimonial.create', 'Testimonial', item.id, { author: item.authorName });
  res.status(201).json({ ok: true, data: item });
});

router.patch('/testimonials/:id', validate({ body: testimonialUpdateSchema }), async (req, res) => {
  const id = param(req, 'id');
  const body = req.body as typeof testimonialUpdateSchema._output;
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw notFound('Témoignage introuvable.');

  const data: Prisma.TestimonialUncheckedUpdateInput = {};
  if (body.authorName !== undefined) data.authorName = body.authorName;
  if (body.authorRole !== undefined) data.authorRole = trimmed(body.authorRole);
  if (body.company !== undefined) data.company = trimmed(body.company);
  if (body.quote !== undefined) data.quote = body.quote;
  if (body.rating !== undefined) data.rating = body.rating;
  if (body.avatar !== undefined) data.avatar = trimmed(body.avatar);
  if (body.published !== undefined) data.published = body.published;
  if (body.order !== undefined) data.order = body.order;

  const item = await prisma.testimonial.update({ where: { id }, data });
  await audit(req, 'testimonial.update', 'Testimonial', item.id, { author: item.authorName });
  res.json({ ok: true, data: item });
});

router.delete('/testimonials/:id', async (req, res) => {
  const id = param(req, 'id');
  const item = await prisma.testimonial.findUnique({ where: { id } });
  if (!item) throw notFound('Témoignage introuvable.');
  await prisma.testimonial.delete({ where: { id } });
  await audit(req, 'testimonial.delete', 'Testimonial', id, { author: item.authorName });
  res.json({ ok: true, data: { id } });
});

/* ──────────────────────────────── Équipe ────────────────────────────────── */

router.get('/team', async (_req, res) => {
  const items = await prisma.teamMember.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  res.json({ ok: true, data: { items, total: items.length } });
});

router.get('/team/:id', async (req, res) => {
  const item = await prisma.teamMember.findUnique({ where: { id: param(req, 'id') } });
  if (!item) throw notFound('Membre introuvable.');
  res.json({ ok: true, data: item });
});

router.post('/team', validate({ body: teamCreateSchema }), async (req, res) => {
  const body = req.body as typeof teamCreateSchema._output;
  const item = await prisma.teamMember.create({
    data: {
      name: body.name,
      role: body.role,
      bio: body.bio,
      photo: trimmed(body.photo),
      email: trimmed(body.email),
      phone: trimmed(body.phone),
      linkedin: trimmed(body.linkedin),
      skills: body.skills ?? [],
      order: body.order,
      active: body.active ?? true,
    },
  });
  await audit(req, 'team.create', 'TeamMember', item.id, { name: item.name });
  res.status(201).json({ ok: true, data: item });
});

router.patch('/team/:id', validate({ body: teamUpdateSchema }), async (req, res) => {
  const id = param(req, 'id');
  const body = req.body as typeof teamUpdateSchema._output;
  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) throw notFound('Membre introuvable.');

  const data: Prisma.TeamMemberUncheckedUpdateInput = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.role !== undefined) data.role = body.role;
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.photo !== undefined) data.photo = trimmed(body.photo);
  if (body.email !== undefined) data.email = trimmed(body.email);
  if (body.phone !== undefined) data.phone = trimmed(body.phone);
  if (body.linkedin !== undefined) data.linkedin = trimmed(body.linkedin);
  if (body.skills !== undefined) data.skills = body.skills;
  if (body.order !== undefined) data.order = body.order;
  if (body.active !== undefined) data.active = body.active;

  const item = await prisma.teamMember.update({ where: { id }, data });
  await audit(req, 'team.update', 'TeamMember', item.id, { name: item.name });
  res.json({ ok: true, data: item });
});

router.delete('/team/:id', async (req, res) => {
  const id = param(req, 'id');
  const item = await prisma.teamMember.findUnique({ where: { id } });
  if (!item) throw notFound('Membre introuvable.');
  await prisma.teamMember.delete({ where: { id } });
  await audit(req, 'team.delete', 'TeamMember', id, { name: item.name });
  res.json({ ok: true, data: { id } });
});

/* ─────────────────────────── Options des formulaires ────────────────────── */

router.get('/options', async (_req, res) => {
  const [services, testimonials] = await Promise.all([
    prisma.service.findMany({ select: { id: true, title: true }, orderBy: { order: 'asc' } }),
    prisma.testimonial.findMany({
      select: { id: true, authorName: true, company: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  res.json({ ok: true, data: { services, testimonials } });
});

/**
 * Si le titre change sans slug explicite, on régénère le slug.
 * Sinon on conserve le slug existant (les URL publiées restent stables).
 */
function tislug(title: string | undefined, fallback: string): string {
  return title === undefined ? fallback : slugify(title);
}

export default router;
