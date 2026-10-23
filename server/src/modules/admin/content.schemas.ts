import { z } from 'zod';
import { PostCategory, ProjectCategory, ProjectStatus } from '@prisma/client';

const imageSchema = z
  .string()
  .trim()
  .max(500)
  .regex(/^(https?:\/\/|\/)/, 'Image : URL absolue ou chemin commençant par /');

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (minuscules, chiffres, tirets)')
  .optional();

const booleanString = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'string' ? v === 'true' || v === 'on' : v))
  .optional();

const stringArray = z
  .union([z.array(z.string()), z.string()])
  .transform((v) => (Array.isArray(v) ? v.filter((s) => s.trim().length > 0) : v.split(',').map((s) => s.trim()).filter((s) => s.length > 0)))
  .optional();

export const postCreateSchema = z.object({
  title: z.string().trim().min(3, 'Titre trop court').max(160),
  slug: slugSchema,
  excerpt: z.string().trim().min(10).max(320),
  content: z.string().trim().min(20, 'Contenu trop court'),
  coverImage: z.union([imageSchema, z.literal('')]).optional(),
  category: z.nativeEnum(PostCategory).default('CONSEILS'),
  tags: stringArray,
  authorName: z.string().trim().min(2).max(80).default('B.A. Construction'),
  authorRole: z.string().trim().max(80).optional().or(z.literal('')),
  readMinutes: z.coerce.number().int().min(1).max(60).default(5),
  published: booleanString.default(true),
  publishedAt: z.coerce.date().optional(),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(160).optional().or(z.literal('')),
});

export const postUpdateSchema = postCreateSchema.partial();

export const serviceCreateSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: slugSchema,
  eyebrow: z.string().trim().max(60).optional().or(z.literal('')),
  excerpt: z.string().trim().min(10).max(280),
  description: z.string().trim().min(20),
  icon: z.string().trim().min(2).max(40).default('Building2'),
  coverImage: z.union([imageSchema, z.literal('')]).optional(),
  highlights: stringArray,
  deliverables: stringArray,
  processNote: z.string().trim().max(400).optional().or(z.literal('')),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(160).optional().or(z.literal('')),
  featured: booleanString.default(false),
  published: booleanString.default(true),
  order: z.coerce.number().int().min(0).default(0),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const projectCreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: slugSchema,
  subtitle: z.string().trim().max(120).optional().or(z.literal('')),
  category: z.nativeEnum(ProjectCategory),
  status: z.nativeEnum(ProjectStatus).default('COMPLETED'),
  location: z.string().trim().min(2).max(140),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  country: z.string().trim().max(80).default('Togo'),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  area: z.coerce.number().positive(),
  budget: z.coerce.number().int().positive().optional().or(z.literal('')),
  budgetLabel: z.string().trim().max(60).optional().or(z.literal('')),
  clientName: z.string().trim().max(80).optional().or(z.literal('')),
  excerpt: z.string().trim().min(10).max(320),
  description: z.string().trim().min(20),
  challenges: z.string().trim().optional().or(z.literal('')),
  solution: z.string().trim().optional().or(z.literal('')),
  features: stringArray,
  materials: stringArray,
  gallery: stringArray,
  coverImage: z.union([imageSchema, z.literal('')]).optional(),
  videoUrl: z.union([imageSchema, z.literal('')]).optional(),
  virtualTourUrl: z.union([imageSchema, z.literal('')]).optional(),
  serviceId: z.string().cuid().optional().or(z.literal('')),
  testimonialId: z.string().cuid().optional().or(z.literal('')),
  featured: booleanString.default(false),
  published: booleanString.default(true),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(160).optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const testimonialCreateSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  authorRole: z.string().trim().max(80).optional().or(z.literal('')),
  company: z.string().trim().max(80).optional().or(z.literal('')),
  quote: z.string().trim().min(10).max(600),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatar: z.union([imageSchema, z.literal('')]).optional(),
  published: booleanString.default(true),
  order: z.coerce.number().int().min(0).default(0),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

export const teamCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(80),
  bio: z.string().trim().min(10).max(600),
  photo: z.union([imageSchema, z.literal('')]).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  skills: stringArray,
  order: z.coerce.number().int().min(0).default(0),
  active: booleanString.default(true),
});

export const teamUpdateSchema = teamCreateSchema.partial();
