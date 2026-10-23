import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProd ? [{ emit: 'event', level: 'error' }, { emit: 'event', level: 'warn' }] : ['warn', 'error'],
  });

if (!env.isProd) globalForPrisma.prisma = prisma;

prisma.$on('error' as never, (e: unknown) => logger.error({ err: e }, 'Erreur Prisma'));
