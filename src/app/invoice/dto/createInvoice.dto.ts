import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength, Min } from 'class-validator';

import { InvoiceNamespace } from '../namespace/invoice.namespace';

export class CreateInvoiceDto {
  @ApiPropertyOptional({ example: 'INV-3307', description: 'Left out → the next number is assigned' })
  @IsOptional()
  @IsString()
  @Matches(/^INV-\d+$/)
  number?: string;

  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serviceId?: string | null;

  @ApiPropertyOptional({ example: 'VPS Hosting', description: 'A plan product or "Software Licenses"' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  product?: string | null;

  @ApiProperty({ example: 340 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ enum: InvoiceNamespace.EStatus, default: InvoiceNamespace.EStatus.PENDING })
  @IsOptional()
  @IsEnum(InvoiceNamespace.EStatus)
  status?: InvoiceNamespace.EStatus;

  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  dueAt: string;

  @ApiPropertyOptional({ example: 'Pro VPS — October 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
