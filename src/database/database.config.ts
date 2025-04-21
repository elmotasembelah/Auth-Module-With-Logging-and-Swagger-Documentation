import { ConfigService } from '@nestjs/config';

export const getMongoConfig = (
  configService: ConfigService,
): { uri: string } => ({
  uri: configService.get<string>('MONGODB_URI', ''),
});
