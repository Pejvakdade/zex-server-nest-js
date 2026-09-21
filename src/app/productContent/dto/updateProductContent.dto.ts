/** --------------------------------------------------------------------------------------------------------------------
 * @file updateProductContent.dto.ts
 * @fileOverview admin edit payload for one product page. Every field is optional so the editor can
 *               save a single section; the list items are validated item-by-item.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class IconItemDto {
  @ApiPropertyOptional() @IsString() @MaxLength(16) icon: string;
  @ApiPropertyOptional() @IsString() @MaxLength(120) title: string;
  @ApiPropertyOptional() @IsString() @MaxLength(200) subtitle: string;
}

class IconLabelDto {
  @ApiPropertyOptional() @IsString() @MaxLength(16) icon: string;
  @ApiPropertyOptional() @IsString() @MaxLength(80) label: string;
}

class TextItemDto {
  @ApiPropertyOptional() @IsString() @MaxLength(120) label: string;
}

class FaqItemDto {
  @ApiPropertyOptional() @IsString() @MaxLength(300) question: string;
  @ApiPropertyOptional() @IsString() answer: string;
}

export class UpdateProductContentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) heroBadge?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) heroHeading1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) heroHeadingAccent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() heroSubheading?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) heroImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) seoDescription?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) ctaHeading?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ctaSubheading?: string;

  @ApiPropertyOptional({ type: [IconItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IconItemDto)
  featureStrip?: Array<IconItemDto>;

  @ApiPropertyOptional({ type: [IconItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IconItemDto)
  whyChoose?: Array<IconItemDto>;

  @ApiPropertyOptional({ type: [FaqItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faq?: Array<FaqItemDto>;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) gridOneTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) gridOneSubtitle?: string;
  @ApiPropertyOptional({ type: [IconLabelDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IconLabelDto)
  gridOne?: Array<IconLabelDto>;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) gridTwoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) gridTwoSubtitle?: string;
  @ApiPropertyOptional({ type: [IconLabelDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IconLabelDto)
  gridTwo?: Array<IconLabelDto>;

  @ApiPropertyOptional({ type: [TextItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextItemDto)
  includedFeatures?: Array<TextItemDto>;

  @ApiPropertyOptional({ type: [String], example: ['Frankfurt', 'New York'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locationCities?: Array<string>;
}
