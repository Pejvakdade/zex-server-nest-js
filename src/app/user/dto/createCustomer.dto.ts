import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { UserNamespace } from '../namespace/user.namespace';

/** Admin → Customers → "+ Add Customer": a CLIENT account opened by staff with a temporary password. */
export class CreateCustomerDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  company: string;

  @ApiPropertyOptional({ example: 'Jane Doe', description: 'Defaults to the company name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @ApiProperty({ example: 'billing@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, description: 'Temporary password the customer changes after signing in' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiPropertyOptional({ enum: UserNamespace.EUserStatus, default: UserNamespace.EUserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserNamespace.EUserStatus)
  status?: UserNamespace.EUserStatus;
}
