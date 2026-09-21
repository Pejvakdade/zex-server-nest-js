/** --------------------------------------------------------------------------------------------------------------------
 * @file blog.seeder.ts
 * @fileOverview dev-only sample posts, authored by the default admin, inserted once when the table is empty.
 */
import { Injectable, Logger } from '@nestjs/common';

import { BlogNamespace } from '@src/app/blog/namespace/blog.namespace';
import { BlogPostEntity } from '@src/app/blog/domain/entities/blogPost.entity';
import { BlogPostRepository } from '@src/app/blog/domain/repositories/blogPost.repository';
import { readingMinutes } from '@src/app/blog/blog.service';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';
import { UserRepository } from '@src/app/user/domain/repositories/user.repository';

import { SEED_BLOG_POSTS } from './data/blog.data';

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

@Injectable()
export class BlogSeeder {
  private readonly logger = new Logger(BlogSeeder.name);

  constructor(
    private readonly blogPostRepository: BlogPostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    if (await this.blogPostRepository.countDocuments()) return;

    const admin = await this.userRepository.findOne({ userType: UserNamespace.EUserType.ADMIN });

    for (const post of SEED_BLOG_POSTS) {
      const { daysAgo: age, ...row } = post;
      await this.blogPostRepository.create({
        ...row,
        coverImage: null,
        status: BlogNamespace.EStatus.PUBLISHED,
        publishedAt: daysAgo(age),
        readingMinutes: readingMinutes(row.body),
        authorId: admin?._id ?? null,
      } as BlogPostEntity);
    }

    this.logger.log(`Seeded ${SEED_BLOG_POSTS.length} sample blog posts`);
  }
}
