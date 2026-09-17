/** --------------------------------------------------------------------------------------------------------------------
 * @file pagination.dto.ts
 * @fileOverview the page/limit pair every admin list endpoint accepts. Bounds come from
 *               values.constants.Pagination so the API and the docs agree.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { Pagination } from '@src/values/constants';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: Pagination.defPage, minimum: Pagination.minPage })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(Pagination.minPage)
  @Max(Pagination.maxPage)
  page?: number = Pagination.defPage;

  @ApiPropertyOptional({ default: Pagination.defLimit, minimum: Pagination.minLimit, maximum: Pagination.maxLimit })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(Pagination.minLimit)
  @Max(Pagination.maxLimit)
  limit?: number = Pagination.defLimit;
}
