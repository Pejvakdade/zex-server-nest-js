import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'you@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "What's this about?" })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'Tell us how we can help' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
