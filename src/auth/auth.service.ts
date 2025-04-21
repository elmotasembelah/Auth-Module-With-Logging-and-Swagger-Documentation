import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SessionsService } from 'src/sessions/sessions.service';
import { SessionMeta } from 'src/common/types/session-meta.type';
import { RegisterUserDto } from './dto/register-user.dto';
import { PinoLogger } from 'nestjs-pino';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private logger: PinoLogger,
  ) {}

  async signIn({ email, password }: SignInDto, meta: SessionMeta) {
    const user = await this.validateUser(email, password);

    if (!user) {
      this.logger.warn('Invalid login attempt', {
        email,
        ip: meta?.ip || 'unknown',
        userAgent: meta?.agent || 'unknown',
        event: 'auth:login:failed',
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.issueTokensAndSession(
      user,
      meta,
    );

    this.logger.info('User signed in successfully', {
      email: user.email,
      ip: meta?.ip,
      userAgent: meta?.agent,
      event: 'auth:login',
    });

    return {
      message: 'Login successful',
      user: user,
      accessToken,
      refreshToken,
    };
  }

  private async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user;

    return safeUser;
  }

  async register(registerUserDto: RegisterUserDto, meta?: SessionMeta) {
    const { password, passwordConfirmation, ...rest } = registerUserDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException(
        'Password confirmation must match password',
      );
    }

    const existingUser = await this.usersService.findByEmail(rest.email);
    if (existingUser) {
      this.logger.warn('Registration attempt with existing email', {
        email: rest.email,
        ip: meta?.ip || 'unknown',
        userAgent: meta?.agent || 'unknown',
        event: 'auth:register:email_taken',
      });
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.createUser({
      ...rest,
      password: hashedPassword,
    });

    this.logger.info('User registered successfully', {
      email: user.email,
      userId: user._id,
      ip: meta?.ip || 'unknown',
      userAgent: meta?.agent || 'unknown',
      event: 'auth:register:success',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user.toObject();

    const { accessToken, refreshToken } = await this.issueTokensAndSession(
      user,
      meta,
    );

    return {
      message: 'Registration successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  private async issueTokensAndSession(
    user: { _id: unknown; email: string; name: string },
    meta?: SessionMeta,
  ) {
    const session = await this.sessionsService.createEmptySession(
      user._id as string,
      meta,
    );

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      sessionId: session._id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    await this.sessionsService.updateSessionWithRefreshToken(
      session._id as string,
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  async signOut(refreshToken: string) {
    const decoded = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      },
    );

    const session = await this.sessionsService.findValidSessionById(
      decoded.sessionId,
      decoded.id,
    );

    if (!session) {
      this.logger.warn('Logout attempt with invalid or expired session', {
        sessionId: decoded.sessionId,
        userId: decoded.id,
        event: 'auth:logout:invalid-session',
      });
      throw new UnauthorizedException('Session not found');
    }

    await this.sessionsService.invalidateSession(session._id as string);

    this.logger.info('User signed out successfully', {
      sessionId: session._id,
      userId: session.userId,
      event: 'auth:logout:single',
    });
  }

  async signOutAll(userId: string) {
    await this.sessionsService.logoutAllSessions(userId);

    this.logger.info('User signed out from all devices', {
      userId,
      event: 'auth:logout:all',
    });
  }
}
