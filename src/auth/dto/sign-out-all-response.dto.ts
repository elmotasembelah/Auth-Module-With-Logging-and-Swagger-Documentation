import { ApiProperty } from '@nestjs/swagger';

export class SignOutAllResponseDto {
  @ApiProperty({ example: 'Logged out from all devices' })
  message: string;
}
