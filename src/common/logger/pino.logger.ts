// src/common/logger/pino.logger.ts
import pino from 'pino';
import { join } from 'path';

const transport = pino.transport({
  targets: [
    {
      level: 'info',
      target: 'pino/file',
      options: {
        destination: join(__dirname, '../../../logs/combined.log'),
      },
    },
    {
      level: 'error',
      target: 'pino/file',
      options: {
        destination: join(__dirname, '../../../logs/error.log'),
      },
    },
  ],
}) as pino.DestinationStream;

export const logger = pino({ level: 'info' }, transport);
