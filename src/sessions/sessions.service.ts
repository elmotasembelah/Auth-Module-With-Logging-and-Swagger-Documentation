import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './entities/sessions.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SessionMeta } from '../common/types/session-meta.type';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<SessionDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateRefreshTokenViaToken(token: string) {
    const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    const sessions = await this.sessionModel.find({
      userId: decoded.id,
      isValid: true,
    });

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(token, session.hashedRefreshToken);
      if (isMatch) {
        return {
          userId: session.userId,
          email: decoded.email,
          name: decoded.name,
          _id: decoded.id,
        };
      }
    }

    return null;
  }

  async findValidSession(token: string) {
    const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    const sessions = await this.sessionModel.find({
      userId: decoded.id,
      isValid: true,
    });

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(token, session.hashedRefreshToken);
      if (isMatch) return session;
    }

    return null;
  }

  async createEmptySession(userId: string, meta?: SessionMeta) {
    const session = new this.sessionModel({
      userId,
      ipAddress: meta?.ip || null,
      userAgent: meta?.agent || null,
      isValid: true,
    });
    return session.save();
  }

  async updateSessionWithRefreshToken(sessionId: string, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    await this.sessionModel.findByIdAndUpdate(sessionId, {
      hashedRefreshToken: hashed,
    });
  }

  async findValidSessionById(sessionId: string, userId: string) {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId,
      isValid: true,
    });

    return session;
  }

  async invalidateSession(sessionId: string) {
    await this.sessionModel.findByIdAndUpdate(sessionId, { isValid: false });
  }

  async logoutAllSessions(userId: string) {
    await this.sessionModel.updateMany(
      { userId, isValid: true },
      { isValid: false },
    );
  }
}
