import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { ServiceNamespace } from '../namespace/service.namespace';

export class CreateServiceDto {
  @ApiProperty({ example: 'VPS-1042', description: 'Unique human id — uppercase letters, digits and dashes' })
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[A-Z0-9-]+$/)
  serviceId: string;

  @ApiProperty({ description: 'The CLIENT account that owns the service' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ description: 'Plan the service was bought from' })
  @IsOptional()
  @IsUUID()
  planId?: string | null;

  @ApiProperty({ enum: PlanNamespace.EPlanProduct })
  @IsEnum(PlanNamespace.EPlanProduct)
  product: PlanNamespace.EPlanProduct;

  @ApiProperty({ example: 'Pro VPS' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label: string;

  @ApiPropertyOptional({ example: 'Frankfurt' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  location?: string;

  @ApiPropertyOptional({ enum: ServiceNamespace.EStatus, default: ServiceNamespace.EStatus.RUNNING })
  @IsOptional()
  @IsEnum(ServiceNamespace.EStatus)
  status?: ServiceNamespace.EStatus;

  @ApiPropertyOptional({ example: 42, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  cpu?: number | null;

  @ApiPropertyOptional({ example: 61, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  ram?: number | null;

  @ApiPropertyOptional({ example: 37, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  disk?: number | null;

  @ApiProperty({ example: '2027-01-31' })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({ example: 24, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;
}
