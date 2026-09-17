import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PlanNamespace } from '../namespace/plan.namespace';

export class GetPlansDto {
  @ApiPropertyOptional({ enum: PlanNamespace.EPlanProduct })
  @IsOptional()
  @IsEnum(PlanNamespace.EPlanProduct)
  product?: PlanNamespace.EPlanProduct;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  location?: string;
}
