import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Fields mirror the reference Get Started page: full name, email address, password (min 8). */
export class SignUpDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'you@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Minimum 8 characters', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({ required: false, example: 'Acme Ltd' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string;
}
