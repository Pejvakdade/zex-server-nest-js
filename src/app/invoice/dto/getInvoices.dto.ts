import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dto/pagination.dto';
import { InvoiceNamespace } from '../namespace/invoice.namespace';

export class GetInvoicesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InvoiceNamespace.EStatus })
  @IsOptional()
  @IsEnum(InvoiceNamespace.EStatus)
  status?: InvoiceNamespace.EStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Matches number, description, customer name or company' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
