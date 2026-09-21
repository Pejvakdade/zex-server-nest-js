import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dto/pagination.dto';
import { BlogNamespace } from '../namespace/blog.namespace';

/** The dashboard list's query string. */
export class GetAdminBlogPostsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: BlogNamespace.EStatus })
  @IsOptional()
  @IsEnum(BlogNamespace.EStatus)
  status?: BlogNamespace.EStatus;

  @ApiPropertyOptional({ description: 'Matches title or slug' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
