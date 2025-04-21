import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { logger } from './pino.logger';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        logger,
      },
    }),
  ],
  exports: [LoggerModule],
})
export class AppLoggerModule {}
