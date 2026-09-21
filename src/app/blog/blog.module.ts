import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogSeeder } from '@src/database/seeders/blog.seeder';
import { UsersModule } from '@src/app/user/user.module';

import { BlogController } from './blog.controller';
import { BlogPostEntity } from './domain/entities/blogPost.entity';
import { BlogPostRepository } from './domain/repositories/blogPost.repository';
import { BlogService } from './blog.service';

@Module({
  /** UsersModule is imported for its repository (the seeder picks the default admin as author) — and so its seeder runs first. */
  imports: [TypeOrmModule.forFeature([BlogPostEntity]), UsersModule],
  controllers: [BlogController],
  providers: [BlogPostRepository, BlogService, BlogSeeder],
  exports: [BlogService],
})
export class BlogModule implements OnModuleInit {
  constructor(private readonly blogSeeder: BlogSeeder) {}

  async onModuleInit(): Promise<void> {
    await this.blogSeeder.seed();
  }
}
