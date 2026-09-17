import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { TicketNamespace } from '../namespace/ticket.namespace';

export class CreateTicketDto {
  @ApiProperty({ example: 'VPS-1042 reporting sustained high CPU' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'Our VPS has been sitting at 90%+ CPU for two hours...' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({ enum: TicketNamespace.EPriority, default: TicketNamespace.EPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TicketNamespace.EPriority)
  priority?: TicketNamespace.EPriority;

  @ApiPropertyOptional({ description: 'The service the ticket is about' })
  @IsOptional()
  @IsUUID()
  serviceId?: string | null;

  @ApiPropertyOptional({ description: 'Staff only: open the ticket on behalf of this customer' })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
