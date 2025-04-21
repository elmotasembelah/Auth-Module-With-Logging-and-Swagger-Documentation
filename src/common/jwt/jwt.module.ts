import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from './jwt.config';

@Module({
  imports: [
    ConfigModule, // if not already global
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],
  exports: [JwtModule],
})
export class AppJwtModule {}
