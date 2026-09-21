/** --------------------------------------------------------------------------------------------------------------------
 * @file blog.namespace.ts
 * @fileOverview types for blog posts: table name, the publish state and the row / view shapes.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace BlogNamespace {
  export const TABLE_NAME = 'blog_post';

  export enum EStatus {
    DRAFT = 'Draft',
    PUBLISHED = 'Published',
  }

  export interface IBlogPost extends AbstractEntity {
    title: string;
    /** URL segment, unique. Generated from the title when the editor leaves it blank. */
    slug: string;
    /** Short teaser shown on cards and the homepage slider. */
    excerpt: string;
    /** Markdown — rendered (and sanitised) by the frontend. */
    body: string;
    /** Path under the static root (`/uploads/blog/<uuid>.webp`) or null when the post has no cover. */
    coverImage: string | null;
    tags: Array<string>;
    status: EStatus;
    /** Posts are pinned to the front of the homepage slider when this is set. */
    featured: boolean;
    /** Set the first time a post is published; kept on later edits so the date does not drift. */
    publishedAt: Date | null;
    /** Rough read length, recomputed from the body on every save. */
    readingMinutes: number;
    authorId: string | null;
  }

  /** What every client receives: the row plus the author's display name resolved from the relation. */
  export interface IBlogPostView extends Omit<IBlogPost, 'authorId'> {
    authorName: string;
  }
}
