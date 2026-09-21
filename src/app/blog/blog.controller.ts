/** --------------------------------------------------------------------------------------------------------------------
 * @file blog.controller.ts
 * @fileOverview public blog reads (list, homepage slider, tags, one post by slug) plus the dashboard's
 *               list / read / write endpoints under `blog/admin` and the usual `:_id` writes.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard, User } from '@libs/gateKeeper';
import type { TActor } from '@src/common/actor';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/createBlogPost.dto';
import { GetAdminBlogPostsDto } from './dto/getAdminBlogPosts.dto';
import { GetBlogPostsDto } from './dto/getBlogPosts.dto';
import { UpdateBlogPostDto } from './dto/updateBlogPost.dto';

@ApiTags('Blog')
@Controller('blog')
@UseGuards(GateKeeperGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperationWithRoles('Published posts, newest first (paginated, optional tag / search)')
  public async find(@Query() query: GetBlogPostsDto) {
    const result = await this.blogService.findPublished(query);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('home')
  @ApiOperationWithRoles('The posts the homepage slider shows: featured first, then newest')
  public async findForHome() {
    const result = await this.blogService.findForHome();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('tags')
  @ApiOperationWithRoles('Distinct tags across published posts')
  public async findTags() {
    const result = await this.blogService.findTags();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('slug/:slug')
  @ApiParam({ name: 'slug', type: String })
  @ApiOperationWithRoles('One published post by its slug')
  public async findBySlug(@Param('slug') slug: string) {
    const result = await this.blogService.findBySlug(slug);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('admin')
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Every post, drafts included, for the dashboard (paginated, optional status / search)')
  public async findForAdmin(@Query() query: GetAdminBlogPostsDto) {
    const result = await this.blogService.findForAdmin(query);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('admin/:_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('One post by id, any status, for the editor')
  public async findOneForAdmin(@Param('_id') _id: string) {
    const result = await this.blogService.findById(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Create a post (the signed-in staff member becomes its author)')
  public async create(@User() actor: TActor, @Body() dto: CreateBlogPostDto) {
    const result = await this.blogService.create(dto, actor._id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Patch(':_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Update a post')
  public async update(@Param('_id') _id: string, @Body() dto: UpdateBlogPostDto) {
    const result = await this.blogService.update(_id, dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.UPDATE,
    };
  }

  @Delete(':_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Delete a post')
  public async remove(@Param('_id') _id: string) {
    const result = await this.blogService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
