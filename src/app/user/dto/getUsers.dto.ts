import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dto/pagination.dto';
import { UserNamespace } from '../namespace/user.namespace';

export class GetUsersDto extends PaginationQueryDto {
  /** One type, or a comma-separated list — the Staff table shows admin and staff together. */
  @ApiPropertyOptional({ example: 'admin,staff', description: 'One or more of admin, staff, client' })
  @IsOptional()
  @IsString()
  @Matches(/^(admin|staff|client)(,(admin|staff|client))*$/)
  userType?: string;

  @ApiPropertyOptional({ enum: UserNamespace.EUserStatus })
  @IsOptional()
  @IsEnum(UserNamespace.EUserStatus)
  status?: UserNamespace.EUserStatus;

  @ApiPropertyOptional({ description: 'Matches name, email or company, case-insensitive' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
