import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({ example: '68050159538406c137062a5c' })
  id: string;

  @ApiProperty({ example: 'mo2@gmail.com' })
  email: string;
}
