/** --------------------------------------------------------------------------------------------------------------------
 * @file upload.service.ts
 * @fileOverview stores hero banner images under `public/uploads/banners` after checking that they are exactly
 *               the size the public hero renders at (see BANNER_WIDTH / BANNER_HEIGHT). The buffer arrives from
 *               multer's memory storage, so nothing touches the disk until the checks pass.
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { imageSize } from 'image-size';
import { extname, join } from 'path';

import values from '@src/values';
import {
  BANNER_HEIGHT,
  BANNER_MIME_TYPES,
  BANNER_UPLOAD_DIR,
  BANNER_WIDTH,
  BLOG_COVER_MIN_HEIGHT,
  BLOG_COVER_MIN_WIDTH,
  BLOG_COVER_UPLOAD_DIR,
  BRAND_MIME_TYPES,
  BRAND_UPLOAD_DIR,
} from '@src/values/constants';

export interface IUploadedImage {
  /** Path under the static root, e.g. `/uploads/banners/<uuid>.webp`. */
  url: string;
  width: number;
  height: number;
}

/** @deprecated name kept for the banner endpoint; both uploads return the same shape. */
export type IUploadedBanner = IUploadedImage;

@Injectable()
export class UploadService {
  /** Same root ServeStaticModule serves (app.module.ts): `<project>/public`. */
  private readonly publicRoot = join(__dirname, '../../../', 'public');

  /** MIME check + decode; the caller then applies its own size rule. */
  private readImage(file: Express.Multer.File): { width: number; height: number } {
    if (!BANNER_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException({
        message: 'Only JPG, PNG or WebP images are accepted',
        statusCode: values.statusCode.ERROR.UPLOAD.INVALID_TYPE,
      });
    }

    try {
      const size = imageSize(file.buffer);
      return { width: size.width ?? 0, height: size.height ?? 0 };
    } catch {
      throw new BadRequestException({
        message: 'The file is not a readable image',
        statusCode: values.statusCode.ERROR.UPLOAD.INVALID_TYPE,
      });
    }
  }

  /** Writes the buffer under `public/<directory>` with a random name; the extension comes from the mime type, never the client. */
  private async store(file: Express.Multer.File, directory: string): Promise<string> {
    const extension =
      { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg', 'image/x-icon': '.ico', 'image/vnd.microsoft.icon': '.ico' }[file.mimetype] ??
      extname(file.originalname);
    const fileName = `${randomUUID()}${extension}`;
    const target = join(this.publicRoot, directory);

    await mkdir(target, { recursive: true });
    await writeFile(join(target, fileName), file.buffer);

    return `/${directory}/${fileName}`;
  }

  public async saveBanner(file: Express.Multer.File): Promise<IUploadedImage> {
    const { width, height } = this.readImage(file);

    if (width !== BANNER_WIDTH || height !== BANNER_HEIGHT) {
      throw new BadRequestException({
        message: `Image is ${width}×${height} px — a hero banner must be exactly ${BANNER_WIDTH}×${BANNER_HEIGHT} px`,
        statusCode: values.statusCode.ERROR.UPLOAD.WRONG_SIZE,
      });
    }

    return { url: await this.store(file, BANNER_UPLOAD_DIR), width, height };
  }

  /** Blog covers only need to be big enough — cards crop them to fit. */
  public async saveBlogCover(file: Express.Multer.File): Promise<IUploadedImage> {
    const { width, height } = this.readImage(file);

    if (width < BLOG_COVER_MIN_WIDTH || height < BLOG_COVER_MIN_HEIGHT) {
      throw new BadRequestException({
        message: `Image is ${width}×${height} px — a blog cover must be at least ${BLOG_COVER_MIN_WIDTH}×${BLOG_COVER_MIN_HEIGHT} px`,
        statusCode: values.statusCode.ERROR.UPLOAD.WRONG_SIZE,
      });
    }

    return { url: await this.store(file, BLOG_COVER_UPLOAD_DIR), width, height };
  }

  /**
   * Brand assets have no fixed size — a logo, a favicon and a share image all differ — so only the type is
   * checked. SVG / ICO are not decodable by image-size, so their dimensions are reported as 0.
   */
  public async saveBrandAsset(file: Express.Multer.File): Promise<IUploadedImage> {
    if (!BRAND_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException({
        message: 'Only JPG, PNG, WebP, SVG or ICO images are accepted',
        statusCode: values.statusCode.ERROR.UPLOAD.INVALID_TYPE,
      });
    }

    const { width, height } = BANNER_MIME_TYPES.includes(file.mimetype) ? this.readImage(file) : { width: 0, height: 0 };

    return { url: await this.store(file, BRAND_UPLOAD_DIR), width, height };
  }
}
