/** --------------------------------------------------------------------------------------------------------------------
 * @file createBlogPost.dto.ts
 * @fileOverview the editor's save payload. `slug` may be omitted — the service derives one from the title.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { BlogNamespace } from '../namespace/blog.namespace';

export class CreateBlogPostDto {
  @ApiProperty({ example: 'Choosing between a VPS and a dedicated server' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'vps-vs-dedicated',
    description: 'Lowercase letters, digits and dashes. Generated from the title when omitted.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug may only contain lowercase letters, digits and dashes' })
  slug?: string;

  @ApiPropertyOptional({ example: 'A practical guide to picking the right box for your workload.' })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  excerpt?: string = '';

  @ApiProperty({ description: 'Markdown body' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ nullable: true, example: '/uploads/blog/3f2a….webp' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  coverImage?: string | null = null;

  @ApiPropertyOptional({ type: [String], example: ['VPS', 'Guides'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: Array<string> = [];

  @ApiPropertyOptional({ enum: BlogNamespace.EStatus, default: BlogNamespace.EStatus.DRAFT })
  @IsOptional()
  @IsEnum(BlogNamespace.EStatus)
  status?: BlogNamespace.EStatus = BlogNamespace.EStatus.DRAFT;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;
}
