import { ApiProperty } from '@nestjs/swagger';

export class SignOutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}
