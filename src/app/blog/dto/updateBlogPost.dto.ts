import { PartialType } from '@nestjs/swagger';

import { CreateBlogPostDto } from './createBlogPost.dto';

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
