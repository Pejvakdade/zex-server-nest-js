import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dto/pagination.dto';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import { ServiceNamespace } from '../namespace/service.namespace';

export class GetServicesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ServiceNamespace.EStatus })
  @IsOptional()
  @IsEnum(ServiceNamespace.EStatus)
  status?: ServiceNamespace.EStatus;

  @ApiPropertyOptional({ enum: PlanNamespace.EPlanProduct })
  @IsOptional()
  @IsEnum(PlanNamespace.EPlanProduct)
  product?: PlanNamespace.EPlanProduct;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Matches service id, label, customer name or company' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
