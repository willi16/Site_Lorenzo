import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { isSsrAvailable } from './ssr/render.js';

async function bootstrap() {
  const app = createApp();
  const ssrReady = await isSsrAvailable();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(
      {
        port: env.PORT,
        host: env.HOST,
        env: env.NODE_ENV,
        ssr: ssrReady,
        app: env.APP_URL,
      },
      'Serveur B.A. Construction démarré',
    );
  });

  // Arrêt propre : on laisse le temps aux requêtes en cours de se terminer.
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Arrêt du serveur…');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Serveur arrêté proprement');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Arrêt forcé après expiration du délai');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Promesse rejetée non gérée');
  });
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Exception non interceptée — arrêt du processus');
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.fatal({ err: error }, 'Démarrage impossible');
  process.exit(1);
});
