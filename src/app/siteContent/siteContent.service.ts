/** --------------------------------------------------------------------------------------------------------------------
 * @file siteContent.service.ts
 * @fileOverview reads page content, cached like the other public reads.
 */
import { Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '@libs/database/src/redis';
import values from '@src/values';

import { SiteContentEntity } from './domain/entities/siteContent.entity';
import { SiteContentNamespace } from './namespace/siteContent.namespace';
import { SiteContentRepository } from './domain/repositories/siteContent.repository';

const CACHE_TTL_SECONDS = 300;
const CACHE_PREFIX = 'siteContent';

@Injectable()
export class SiteContentService {
  constructor(
    private readonly siteContentRepository: SiteContentRepository,
    private readonly redisService: RedisService,
  ) {}

  public async findByPage(page: SiteContentNamespace.EPage): Promise<Record<string, unknown>> {
    const cacheKey = `${CACHE_PREFIX}:${page}`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis is a cache, not a dependency.
    }

    const row = await this.siteContentRepository.findByPage(page);

    if (!row) {
      throw new NotFoundException({
        message: `No content published for page "${page}"`,
        statusCode: values.statusCode.ERROR.SITE_CONTENT.NOT_FOUND,
      });
    }

    try {
      await this.redisService.set(cacheKey, JSON.stringify(row.content), CACHE_TTL_SECONDS);
    } catch {
      // Best effort.
    }

    return row.content;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description replaces a page's content wholesale (the editor always sends the full object) and
   *              drops the cached copy so the public page picks it up on the next request.
   */
  public async update(
    page: SiteContentNamespace.EPage,
    content: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const row = await this.siteContentRepository.findByPage(page);

    if (!row) {
      throw new NotFoundException({
        message: `No content published for page "${page}"`,
        statusCode: values.statusCode.ERROR.SITE_CONTENT.NOT_FOUND,
      });
    }

    const updated = await this.siteContentRepository.findByIdAndUpdate(row._id, {
      content,
    } as Partial<SiteContentEntity>);
    await this.invalidateCache(page);
    return updated.content;
  }

  /** Every admin write path calls this, or edits appear up to 5 minutes late. */
  public async invalidateCache(page: SiteContentNamespace.EPage): Promise<void> {
    await this.redisService.del(`${CACHE_PREFIX}:${page}`).catch(() => undefined);
  }
}
