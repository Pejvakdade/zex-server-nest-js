import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'The plan being ordered; its location and price come from the plan itself' })
  @IsUUID()
  planId: string;

  @ApiPropertyOptional({ description: 'A control-panel licence to bundle with the server' })
  @IsOptional()
  @IsUUID()
  licenseId?: string;

  @ApiPropertyOptional({ description: 'Add the licence\'s one-off install fee to the first invoice' })
  @IsOptional()
  @IsBoolean()
  installLicense?: boolean;
}
