import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@libs/database/src/postgres';
import { BlogNamespace } from '@src/app/blog/namespace/blog.namespace';
import { UserEntity } from '@src/app/user/domain/entities/user.entity';

@Entity({ name: BlogNamespace.TABLE_NAME })
export class BlogPostEntity extends AbstractEntity implements BlogNamespace.IBlogPost {
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220 })
  slug: string;

  @Column({ type: 'varchar', length: 400, default: '' })
  excerpt: string;

  @Column({ type: 'text', default: '' })
  body: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  coverImage: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags: Array<string>;

  @Index()
  @Column({ type: 'enum', enum: BlogNamespace.EStatus, default: BlogNamespace.EStatus.DRAFT })
  status: BlogNamespace.EStatus;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'int', default: 1 })
  readingMinutes: number;

  /** The staff member who created the post. Nullable so deleting the account keeps the article. */
  @Column({ type: 'uuid', nullable: true })
  authorId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: UserEntity;
}
