import pino from 'pino';
import { config, isDevelopment } from '../config';

export const logger = pino({
  level: config.logging.level,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
