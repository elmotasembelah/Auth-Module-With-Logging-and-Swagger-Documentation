import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { SessionsService } from 'src/sessions/sessions.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payload.type';
import { cookieOptions } from '../config/cookie-options.config';

@Injectable()
export class AuthGuardWithRefresh implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sessionsService: SessionsService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accessToken =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(
        accessToken as string,
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
        },
      );

      const session = await this.sessionsService.findValidSessionById(
        decoded.sessionId,
        decoded.id,
      );

      // failing if statement
      const isSessoinValid = session !== null;

      if (!isSessoinValid) {
        throw new UnauthorizedException('Session no longer valid');
      }

      req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
      return true;
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const refreshToken =
        req.cookies?.refreshToken || (req.headers['x-refresh-token'] as string);

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token required');
      }

      const session = await this.sessionsService.validateRefreshTokenViaToken(
        refreshToken as string,
      );

      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      const payload: JwtPayload = {
        id: session.userId.toString(),
        email: session.email,
        name: session.name,
        sessionId: session._id.toString(),
      };

      const newAccessToken = await this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
      });

      res.setHeader('x-access-token', newAccessToken);
      res.cookie('accessToken', newAccessToken, cookieOptions.accessToken);

      req.user = {
        id: session.userId,
        email: session.email,
        name: session.name,
      };
      return true;
    }
  }
}
