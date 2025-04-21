import { ApiProperty } from '@nestjs/swagger';

export class RegisteredUserDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  __v: number;
}

export class SignUpResponseDto {
  @ApiProperty({ example: 'Registration successful' })
  message: string;

  @ApiProperty({ type: RegisteredUserDto })
  user: RegisteredUserDto;

  @ApiProperty({ example: 'access.token.here' })
  accessToken: string;

  @ApiProperty({ example: 'refresh.token.here' })
  refreshToken: string;
}
