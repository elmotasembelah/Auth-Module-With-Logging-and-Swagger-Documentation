import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuardWithRefresh } from './guards/auth-guard-with-refresh';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInResponseDto } from './dto/Sign-in-response.dto';
import { SignUpResponseDto } from './dto/Sign-up-response.dto';
import { SignOutAllResponseDto } from './dto/sign-out-all-response.dto';
import { clearAuthCookies, setAuthCookies } from './helpers/cookie.helper';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiOperation({
    summary:
      'Sign in and set HttpOnly tokens via cookies, returns tokens for dev/test usage',
  })
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({
    description: 'Login successful, tokens set in cookies',
    type: SignInResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async signIn(
    @Body(ValidationPipe) signInDto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const agent = req.get('user-agent') || null;
    const ip = req.ip || req.connection.remoteAddress || null;
    const { user, accessToken, refreshToken } = await this.authService.signIn(
      signInDto,
      { agent, ip },
    );

    setAuthCookies(res, accessToken, refreshToken);
    return { message: 'Login successful', user, accessToken, refreshToken };
  }

  @Post('register')
  @ApiOperation({
    summary:
      'Register new user and setup Httponly tokens via cookies in prod, return tokens for dev/test usage',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: SignUpResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or email already in use',
  })
  async register(
    @Body(ValidationPipe) registerUserDto: RegisterUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const agent = req.get('user-Agent') || null;
    const ip = req.ip || req.connection.remoteAddress || null;
    const { user, accessToken, refreshToken } = await this.authService.register(
      registerUserDto,
      { agent, ip },
    );

    setAuthCookies(res, accessToken, refreshToken);
    return { message: 'Login successful', user, accessToken, refreshToken };
  }

  @Post('sign-out')
  @UseGuards(AuthGuardWithRefresh)
  @ApiOperation({
    summary:
      'Logout and clear auth cookies, accepts Bearer and x-refresh-token for dev/test',
  })
  @ApiOkResponse({ description: 'Logged out successfully' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid refresh token',
  })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token associated with the session to terminate',
    required: true,
  })
  @ApiBearerAuth()
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    await this.authService.signOut(refreshToken as string);
    clearAuthCookies(res);

    return { message: 'Logged out successfully' };
  }

  @Post('sign-out-all')
  @UseGuards(AuthGuardWithRefresh)
  @ApiOperation({
    summary:
      'Logout from all devices (invalidate all sessions), , accepts Bearer and x-refresh-token for dev/test',
  })
  @ApiOkResponse({
    description: 'All sessions invalidated successfully',
    type: SignOutAllResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token or session invalid',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token associated with the session to terminate',
    required: true,
  })
  async signOutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.signOutAll(req.user!.id);
    clearAuthCookies(res);
    return { message: 'Logged out from all devices' };
  }
}
