/** --------------------------------------------------------------------------------------------------------------------
 * @file createLicense.dto.ts
 * @fileOverview admin create payload; mirrors LICENSE_FIELDS in the reference dashboard, with the
 *               three feature text boxes carried as one array.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateLicenseDto {
  @ApiProperty({ example: 'cPanel Admin Cloud' })
  @IsString()
  @MinLength(1)
  @MaxLength(140)
  name: string;

  @ApiProperty({ example: 'cPanel' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  category: string;

  @ApiPropertyOptional({ example: 'Up to 5 accounts' })
  @IsOptional()
  @IsString()
  description?: string = '';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: Array<string> = [];

  @ApiProperty({ example: 19.99, description: 'Monthly price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 10, description: 'One-off setup charge', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  installFee?: number = 0;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}
