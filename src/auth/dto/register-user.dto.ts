import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user, must be atlaest 3 characters',
  })
  @IsString({ message: 'name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Valid email address',
  })
  @IsString({ message: 'email is required' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Minimum 8 characters, must include at least one letter, one number, and one special character (@$!%*?&)',
  })
  @IsString({ message: 'password is required' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long, and include at least one letter, one number, and one special character (@$!%*?&)',
  })
  password: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'Must match the password exactly',
  })
  @IsString({ message: 'password confirmation is required' })
  passwordConfirmation: string;
}
