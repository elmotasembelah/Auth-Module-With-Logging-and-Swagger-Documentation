import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './entities/sessions.entity';
import { ConfigModule } from '@nestjs/config';
import { AppJwtModule } from 'src/common/jwt/jwt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    AppJwtModule,
    ConfigModule,
  ],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
