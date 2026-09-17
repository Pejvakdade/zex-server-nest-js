import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { TicketNamespace } from '../namespace/ticket.namespace';

/** Staff triage: status and priority. The text of a ticket is never edited after the fact. */
export class UpdateTicketDto {
  @ApiPropertyOptional({ enum: TicketNamespace.EStatus })
  @IsOptional()
  @IsEnum(TicketNamespace.EStatus)
  status?: TicketNamespace.EStatus;

  @ApiPropertyOptional({ enum: TicketNamespace.EPriority })
  @IsOptional()
  @IsEnum(TicketNamespace.EPriority)
  priority?: TicketNamespace.EPriority;
}
