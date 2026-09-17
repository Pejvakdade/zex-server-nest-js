/** --------------------------------------------------------------------------------------------------------------------
 * @file createPlan.dto.ts
 * @fileOverview admin create payload. Fields mirror PLAN_FIELDS + PLAN_FEATURE_FIELDS in the reference
 *               dashboard; `specs` is the free-form jsonb the product decides the keys of.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { PlanNamespace } from '../namespace/plan.namespace';

export class CreatePlanDto {
  @ApiProperty({ enum: PlanNamespace.EPlanProduct })
  @IsEnum(PlanNamespace.EPlanProduct)
  product: PlanNamespace.EPlanProduct;

  @ApiProperty({ example: 'VPS-2' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'For growing projects' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string = '';

  @ApiProperty({ example: 9.99, description: 'Monthly price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean = false;

  @ApiProperty({ example: 'Frankfurt', description: 'City of an existing location' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  location: string;

  @ApiPropertyOptional({ example: { cpu: '2 vCPU Cores', ram: '4 GB', storage: '80 GB' } })
  @IsOptional()
  @IsObject()
  specs?: PlanNamespace.IPlanSpecs = {};

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}
