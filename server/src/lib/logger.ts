import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  base: { service: 'ba-construction-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordHash',
      'req.body.currentPassword',
      'req.body.newPassword',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
  transport: env.isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname,service' },
      },
});
