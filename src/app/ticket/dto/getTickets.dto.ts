import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dto/pagination.dto';
import { TicketNamespace } from '../namespace/ticket.namespace';

export class GetTicketsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TicketNamespace.EStatus })
  @IsOptional()
  @IsEnum(TicketNamespace.EStatus)
  status?: TicketNamespace.EStatus;

  @ApiPropertyOptional({ enum: TicketNamespace.EPriority })
  @IsOptional()
  @IsEnum(TicketNamespace.EPriority)
  priority?: TicketNamespace.EPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Matches number, subject, customer name or company' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
