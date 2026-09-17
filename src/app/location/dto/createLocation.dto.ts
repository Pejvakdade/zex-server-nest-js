/** --------------------------------------------------------------------------------------------------------------------
 * @file createLocation.dto.ts
 * @fileOverview admin create payload; one field per ILocation column.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Frankfurt' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city: string;

  @ApiProperty({ example: 'Germany' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  country: string;

  @ApiProperty({ example: '🇩🇪' })
  @IsString()
  @MaxLength(16)
  flag: string;

  @ApiProperty({ example: 'Equinix FR5' })
  @IsString()
  @MaxLength(120)
  datacenter: string;

  @ApiProperty({ example: '10Gbps+ Premium' })
  @IsString()
  @MaxLength(80)
  network: string;

  @ApiProperty({ example: 'Latency to EU' })
  @IsString()
  @MaxLength(80)
  latencyLabel: string;

  @ApiProperty({ example: '< 10 ms' })
  @IsString()
  @MaxLength(40)
  latencyValue: string;

  @ApiPropertyOptional({ type: [String], example: ['VPS Hosting', 'Dedicated Servers'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: Array<string> = [];

  @ApiPropertyOptional({ example: 'Our flagship European site.' })
  @IsOptional()
  @IsString()
  description?: string = '';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number | null = null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number | null = null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}
