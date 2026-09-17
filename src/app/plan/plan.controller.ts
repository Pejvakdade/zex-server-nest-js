/** --------------------------------------------------------------------------------------------------------------------
 * @file plan.controller.ts
 * @fileOverview public pricing reads plus the admin dashboard's writes.
 *
 * @note `admin/all` is declared before `:_id` — Nest matches routes in declaration order and the
 *       param route would otherwise swallow it.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { CreatePlanDto } from './dto/createPlan.dto';
import { GetPlansDto } from './dto/getPlans.dto';
import { PlanService } from './plan.service';
import { PlanNamespace } from './namespace/plan.namespace';
import { UpdatePlanDto } from './dto/updatePlan.dto';

@ApiTags('Plan')
@Controller('plan')
@UseGuards(GateKeeperGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  /** With `product`, returns that product's plans; without it, every product grouped by name. */
  @Get()
  @ApiOperationWithRoles('List pricing plans')
  public async find(@Query() query: GetPlansDto) {
    const result = query.product
      ? await this.planService.findForProduct(query.product, query.location)
      : await this.planService.findAllGrouped();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('admin/all')
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Every plan, inactive included, for the dashboard')
  public async findAllForAdmin() {
    const result = await this.planService.findAllForAdmin();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('locations/:product')
  @ApiParam({ name: 'product', enum: PlanNamespace.EPlanProduct })
  @ApiOperationWithRoles('Locations a product is offered in')
  public async locations(@Param('product') product: PlanNamespace.EPlanProduct) {
    const result = await this.planService.findLocationsForProduct(product);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get(':_id')
  @ApiParam(DeclareApiParam)
  @ApiOperationWithRoles('Get one plan')
  public async findById(@Param('_id') _id: string) {
    const result = await this.planService.findById(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Create a plan')
  public async create(@Body() dto: CreatePlanDto) {
    const result = await this.planService.create(dto);

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
  @ApiOperationWithRoles('Update a plan')
  public async update(@Param('_id') _id: string, @Body() dto: UpdatePlanDto) {
    const result = await this.planService.update(_id, dto);

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
  @ApiOperationWithRoles('Delete a plan')
  public async remove(@Param('_id') _id: string) {
    const result = await this.planService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
