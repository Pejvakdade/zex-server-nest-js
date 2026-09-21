/** --------------------------------------------------------------------------------------------------------------------
 * @file blog.service.ts
 * @fileOverview blog posts: public reads cached in Redis, admin writes that derive the slug, the reading
 *               time and the publish date, and flush the cache.
 *
 * @description
 *   The public site reads posts on every home page visit (the slider), so those reads are cached the
 *   same way plans are — short TTL, Redis errors swallowed. Every write drops every cached key: a post
 *   can move between the list, the slider and the tag list in one edit, so per-key invalidation is
 *   not worth the bookkeeping.
 */
import { Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '@libs/database/src/redis';
import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import values from '@src/values';

import { BlogNamespace } from './namespace/blog.namespace';
import { BlogPostEntity } from './domain/entities/blogPost.entity';
import { BlogPostRepository } from './domain/repositories/blogPost.repository';
import { CreateBlogPostDto } from './dto/createBlogPost.dto';
import { GetBlogPostsDto } from './dto/getBlogPosts.dto';
import { GetAdminBlogPostsDto } from './dto/getAdminBlogPosts.dto';
import { UpdateBlogPostDto } from './dto/updateBlogPost.dto';

const CACHE_TTL_SECONDS = 300;
const CACHE_PREFIX = 'blog';
/** How many posts the homepage slider shows. */
export const HOME_POST_COUNT = 8;
/** Average adult reading speed; the number only has to be plausible, not exact. */
const WORDS_PER_MINUTE = 200;

type TPaginatedView = TFindWithPaginationResult<BlogNamespace.IBlogPostView>;

/** "Choosing a VPS: what matters?" → "choosing-a-vps-what-matters". */
export const slugify = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200) || 'post';

export const readingMinutes = (markdown: string): number => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

@Injectable()
export class BlogService {
  constructor(
    private readonly blogPostRepository: BlogPostRepository,
    private readonly redisService: RedisService,
  ) {}

  private notFound(): never {
    throw new NotFoundException({
      message: 'Post not found',
      statusCode: values.statusCode.ERROR.BLOG.NOT_FOUND,
    });
  }

  /** Strips the joined author down to a display name; the relation itself never leaves the API. */
  private toView(post: BlogPostEntity): BlogNamespace.IBlogPostView {
    const { author, authorId, ...row } = post;
    return { ...row, authorName: author?.fullName ?? 'ZexServer' };
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description read-through cache. A cache miss or an unreachable Redis falls back to Postgres.
   */
  private async cached<T>(key: string, read: () => Promise<T>): Promise<T> {
    const cacheKey = `${CACHE_PREFIX}:${key}`;

    try {
      const hit = await this.redisService.get(cacheKey);
      if (hit) return JSON.parse(hit);
    } catch {
      // Redis is a cache, not a dependency.
    }

    const value = await read();

    try {
      await this.redisService.set(cacheKey, JSON.stringify(value), CACHE_TTL_SECONDS);
    } catch {
      // Failing to warm the cache is not a failed request.
    }

    return value;
  }

  /** Every cached key lives under one prefix, so a single pattern delete clears them all. */
  public async invalidateCache(): Promise<void> {
    try {
      await this.redisService.delByPattern(`${CACHE_PREFIX}:*`);
    } catch {
      // Best effort — the TTL takes over.
    }
  }

  // ---- public reads -------------------------------------------------------------------------------------------------

  public async findPublished(query: GetBlogPostsDto): Promise<TPaginatedView> {
    const { page, limit, tag, search } = query;
    const key = `list:${page}:${limit}:${tag ?? ''}:${search ?? ''}`;

    return this.cached(key, async () => {
      const result = await this.blogPostRepository.findPublished({ tag, search }, page, limit);
      return { ...result, docs: result.docs.map((post) => this.toView(post)) };
    });
  }

  public async findForHome(): Promise<Array<BlogNamespace.IBlogPostView>> {
    return this.cached('home', async () =>
      (await this.blogPostRepository.findForHome(HOME_POST_COUNT)).map((post) => this.toView(post)),
    );
  }

  public async findTags(): Promise<Array<string>> {
    return this.cached('tags', () => this.blogPostRepository.findPublishedTags());
  }

  public async findBySlug(slug: string): Promise<BlogNamespace.IBlogPostView> {
    const post = await this.cached(`slug:${slug}`, async () => {
      const row = await this.blogPostRepository.findPublishedBySlug(slug);
      return row ? this.toView(row) : null;
    });

    if (!post) this.notFound();
    return post;
  }

  // ---- admin --------------------------------------------------------------------------------------------------------

  public async findForAdmin(query: GetAdminBlogPostsDto): Promise<TPaginatedView> {
    const { page, limit, status, search } = query;
    const result = await this.blogPostRepository.findForAdmin({ status, search }, page, limit);
    return { ...result, docs: result.docs.map((post) => this.toView(post)) };
  }

  public async findById(_id: string): Promise<BlogNamespace.IBlogPostView> {
    const post = await this.blogPostRepository.findWithAuthor(_id);
    if (!post) this.notFound();
    return this.toView(post);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description the first free slug among `base`, `base-2`, `base-3`… — skipping the post being edited,
   *              so saving a post without changing its title keeps its slug.
   */
  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const taken = new Set(await this.blogPostRepository.findSlugsLike(base));

    if (excludeId) {
      const own = await this.blogPostRepository.findById(excludeId);
      if (own) taken.delete(own.slug);
    }

    if (!taken.has(base)) return base;
    for (let n = 2; ; n++) {
      const candidate = `${base}-${n}`;
      if (!taken.has(candidate)) return candidate;
    }
  }

  public async create(dto: CreateBlogPostDto, authorId: string): Promise<BlogNamespace.IBlogPostView> {
    const slug = await this.uniqueSlug(dto.slug || slugify(dto.title));
    const status = dto.status ?? BlogNamespace.EStatus.DRAFT;

    const created = await this.blogPostRepository.create({
      ...dto,
      slug,
      status,
      tags: dto.tags ?? [],
      readingMinutes: readingMinutes(dto.body),
      publishedAt: status === BlogNamespace.EStatus.PUBLISHED ? new Date() : null,
      authorId,
    } as BlogPostEntity);

    await this.invalidateCache();
    return this.findById(created._id);
  }

  public async update(_id: string, dto: UpdateBlogPostDto): Promise<BlogNamespace.IBlogPostView> {
    const existing = await this.blogPostRepository.findById(_id);
    if (!existing) this.notFound();

    const patch: Partial<BlogPostEntity> = { ...dto } as Partial<BlogPostEntity>;

    // A blank slug means "regenerate from the (possibly new) title"; a given one is still de-duplicated.
    if ('slug' in dto || ('title' in dto && !existing.slug)) {
      patch.slug = await this.uniqueSlug(dto.slug || slugify(dto.title ?? existing.title), _id);
    }
    if (dto.body !== undefined) patch.readingMinutes = readingMinutes(dto.body);

    const publishingNow =
      dto.status === BlogNamespace.EStatus.PUBLISHED && existing.status !== BlogNamespace.EStatus.PUBLISHED;
    if (publishingNow && !existing.publishedAt) patch.publishedAt = new Date();

    await this.blogPostRepository.findByIdAndUpdate(_id, patch);
    await this.invalidateCache();
    return this.findById(_id);
  }

  public async remove(_id: string): Promise<BlogNamespace.IBlogPostView> {
    const removed = await this.blogPostRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    await this.invalidateCache();
    return this.toView(removed);
  }
}
