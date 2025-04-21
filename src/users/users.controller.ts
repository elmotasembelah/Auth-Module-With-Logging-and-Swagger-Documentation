import { Body, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuardWithRefresh } from 'src/auth/guards/auth-guard-with-refresh';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MeResponseDto } from './dto/me-response.dto';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthGuardWithRefresh)
  @Get('me')
  @ApiOperation({
    summary:
      'Get current authenticated user info, accepts Bearer and x-refresh-token for dev/test',
  })
  @ApiOkResponse({
    description: 'Authenticated user data',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing access/refresh token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuardWithRefresh)
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token associated with the session to terminate',
    required: true,
  })
  getMe(@Req() req: Request) {
    return req.user;
  }
}
