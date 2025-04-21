import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (config: ConfigService) => ({
  secret: config.get<string>('JWT_ACCESS_SECRET', ''),
  signOptions: {
    expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
  },
});
