import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { UserNamespace } from '../namespace/user.namespace';

/** What an admin may change on someone else's account. Email and password stay with the owner. */
export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string;

  @ApiPropertyOptional({ enum: UserNamespace.EUserStatus })
  @IsOptional()
  @IsEnum(UserNamespace.EUserStatus)
  status?: UserNamespace.EUserStatus;

  @ApiPropertyOptional({ enum: UserNamespace.EUserType })
  @IsOptional()
  @IsEnum(UserNamespace.EUserType)
  userType?: UserNamespace.EUserType;
}
