/** --------------------------------------------------------------------------------------------------------------------
 * @file upload.controller.ts
 * @fileOverview admin-only image uploads for the site editors (hero banners, blog covers, brand assets).
 */
import {
  BadRequestException,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import {
  ADMIN_ROLES,
  BANNER_HEIGHT,
  BANNER_MAX_BYTES,
  BANNER_WIDTH,
  BLOG_COVER_MAX_BYTES,
  BLOG_COVER_MIN_HEIGHT,
  BLOG_COVER_MIN_WIDTH,
  BRAND_MAX_BYTES,
} from '@src/values/constants';

import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(GateKeeperGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('banner')
  @AllowedRoles(ADMIN_ROLES)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiOperationWithRoles(`Upload a hero banner (exactly ${BANNER_WIDTH}×${BANNER_HEIGHT} px, JPG / PNG / WebP, max 2 MB)`)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: BANNER_MAX_BYTES, files: 1 } }))
  public async uploadBanner(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException({
        message: 'No file was sent — use the multipart field "file"',
        statusCode: values.statusCode.ERROR.UPLOAD.INVALID_TYPE,
      });
    }

    const result = await this.uploadService.saveBanner(file);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Post('blog-cover')
  @AllowedRoles(ADMIN_ROLES)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiOperationWithRoles(`Upload a blog cover (at least ${BLOG_COVER_MIN_WIDTH}×${BLOG_COVER_MIN_HEIGHT} px, JPG / PNG / WebP, max 3 MB)`)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: BLOG_COVER_MAX_BYTES, files: 1 } }))
  public async uploadBlogCover(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException({
        message: 'No file was sent — use the multipart field "file"',
        statusCode: values.statusCode.ERROR.UPLOAD.INVALID_TYPE,
      });
    }

    const result = await this.uploadService.saveBlogCover(file);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Post('brand')
  @AllowedRoles(ADMIN_ROLES)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiOperationWithRoles('Upload a brand asset — logo, favicon or share image (JPG / PNG / WebP / SVG / ICO, any size, max 1 MB)')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: BRAND_MAX_BYTES, files: 1 } }))
  public async uploadBrand(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException({
        message: 'No file was sent — use the multipart field "file"',
        statusCode: values.statusCode.ERROR.UPLOAD.INVALID_TYPE,
      });
    }

    const result = await this.uploadService.saveBrandAsset(file);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }
}
