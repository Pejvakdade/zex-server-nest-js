import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { BlogNamespace } from '../../namespace/blog.namespace';
import { BlogPostEntity } from '../entities/blogPost.entity';

@Injectable()
export class BlogPostRepository extends AbstractRepository<BlogPostEntity> {
  constructor(
    @InjectRepository(BlogPostEntity) repository: Repository<BlogPostEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  /** Every read joins the author so the service can attach `authorName` without a second query. */
  private base(): SelectQueryBuilder<BlogPostEntity> {
    return this.repository.createQueryBuilder('post').leftJoinAndSelect('post.author', 'author');
  }

  private async paginate(
    qb: SelectQueryBuilder<BlogPostEntity>,
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<BlogPostEntity>> {
    const [docs, totalDocs] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { docs, totalDocs, limit, page, totalPages: Math.ceil(totalDocs / limit) };
  }

  /** The public list: published only, newest first, optional tag and title/excerpt search. */
  public async findPublished(
    filter: { tag?: string; search?: string },
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<BlogPostEntity>> {
    const qb = this.base()
      .where('post.status = :status', { status: BlogNamespace.EStatus.PUBLISHED })
      .orderBy('post.publishedAt', 'DESC');

    if (filter.tag) qb.andWhere(':tag = ANY(post.tags)', { tag: filter.tag });
    if (filter.search) {
      qb.andWhere('(post.title ILIKE :search OR post.excerpt ILIKE :search)', { search: `%${filter.search}%` });
    }

    return this.paginate(qb, page, limit);
  }

  /** The homepage slider: featured posts first, then the newest, capped at `limit`. */
  public async findForHome(limit: number): Promise<Array<BlogPostEntity>> {
    return this.base()
      .where('post.status = :status', { status: BlogNamespace.EStatus.PUBLISHED })
      .orderBy('post.featured', 'DESC')
      .addOrderBy('post.publishedAt', 'DESC')
      .take(limit)
      .getMany();
  }

  public async findPublishedBySlug(slug: string): Promise<BlogPostEntity | null> {
    return this.base()
      .where('post.slug = :slug', { slug })
      .andWhere('post.status = :status', { status: BlogNamespace.EStatus.PUBLISHED })
      .getOne();
  }

  public async findWithAuthor(_id: string): Promise<BlogPostEntity | null> {
    return this.base().where('post._id = :_id', { _id }).getOne();
  }

  /** Distinct tags across published posts, for the filter chips on the public list. */
  public async findPublishedTags(): Promise<Array<string>> {
    const rows = await this.repository
      .createQueryBuilder('post')
      .select('DISTINCT unnest(post.tags)', 'tag')
      .where('post.status = :status', { status: BlogNamespace.EStatus.PUBLISHED })
      .orderBy('tag', 'ASC')
      .getRawMany<{ tag: string }>();

    return rows.map((row) => row.tag);
  }

  /** The dashboard list: every state, latest edit first. */
  public async findForAdmin(
    filter: { status?: BlogNamespace.EStatus; search?: string },
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<BlogPostEntity>> {
    const qb = this.base().orderBy('post.updatedAt', 'DESC');

    if (filter.status) qb.andWhere('post.status = :status', { status: filter.status });
    if (filter.search) {
      qb.andWhere('(post.title ILIKE :search OR post.slug ILIKE :search)', { search: `%${filter.search}%` });
    }

    return this.paginate(qb, page, limit);
  }

  /** Slugs that start with `base` — the service picks the first free `base`, `base-2`, `base-3` … */
  public async findSlugsLike(base: string): Promise<Array<string>> {
    const rows = await this.repository
      .createQueryBuilder('post')
      .select('post.slug', 'slug')
      .where('post.slug = :base OR post.slug LIKE :pattern', { base, pattern: `${base}-%` })
      .getRawMany<{ slug: string }>();

    return rows.map((row) => row.slug);
  }
}
