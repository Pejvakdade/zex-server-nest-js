import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dto/pagination.dto';

/** The public list's query string. */
export class GetBlogPostsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'VPS' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;

  @ApiPropertyOptional({ description: 'Matches title or excerpt' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
