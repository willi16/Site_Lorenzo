import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

/** Tableau de bord : indicateurs clés de l'activité commerciale. */
router.get(
  '/dashboard',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  async (_req, res) => {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      wonLeads,
      subscribers,
      activeSubscribers,
      appointments,
      pendingAppointments,
      projects,
      publishedProjects,
      posts,
      publishedPosts,
      totalViews,
      recentLeads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: since30 } } }),
      prisma.lead.count({ where: { status: { in: ['QUALIFIED', 'WON'] } } }),
      prisma.lead.count({ where: { status: 'WON' } }),
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.project.count(),
      prisma.project.count({ where: { published: true } }),
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.project.aggregate({ _sum: { views: true } }),
      prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);

    const conversion = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0;

    res.json({
      ok: true,
      data: {
        leads: { total: totalLeads, last30Days: newLeads, qualified: qualifiedLeads, won: wonLeads, conversion },
        newsletter: { total: subscribers, active: activeSubscribers },
        appointments: { total: appointments, pending: pendingAppointments },
        content: {
          projects: { total: projects, published: publishedProjects },
          posts: { total: posts, published: publishedPosts },
          views: totalViews._sum.views ?? 0,
        },
        recentLeads,
      },
    });
  },
);

/** Journal d'audit des actions sensibles. */
router.get(
  '/audit',
  requireAuth,
  requireRole('ADMIN'),
  async (_req, res) => {
    const items = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { email: true, name: true } } },
    });
    res.json({ ok: true, data: items });
  },
);

export default router;
