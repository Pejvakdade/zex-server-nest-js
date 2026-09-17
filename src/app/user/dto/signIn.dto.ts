import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'you@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  /** mirrors the reference login page's "Keep me logged in" checkbox: it widens the JWT lifetime. */
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  keepLoggedIn?: boolean;
}
