/** --------------------------------------------------------------------------------------------------------------------
 * @file service.controller.ts
 * @fileOverview staff manage services; a customer can only list and view their own.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard, User } from '@libs/gateKeeper';
import type { TActor } from '@src/common/actor';
import values from '@src/values';
import { ADMIN_ROLES, ANY_SIGNED_IN } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { CreateServiceDto } from './dto/createService.dto';
import { GetServicesDto } from './dto/getServices.dto';
import { ServiceService } from './service.service';
import { UpdateServiceDto } from './dto/updateService.dto';

@ApiTags('Service')
@Controller('service')
@UseGuards(GateKeeperGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Every service, paginated, with its customer')
  public async find(@Query() query: GetServicesDto) {
    const result = await this.serviceService.findPaginated(query);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  /** Declared before `:_id` so the literal segment is not swallowed by the param route. */
  @Get('me')
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles("The caller's own services")
  public async mine(@User() actor: TActor) {
    const result = await this.serviceService.findMine(actor._id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get(':_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles('One service — its owner or staff')
  public async findOne(@User() actor: TActor, @Param('_id') _id: string) {
    const result = await this.serviceService.findOneFor(actor, _id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Provision a service for a customer')
  public async create(@Body() dto: CreateServiceDto) {
    const result = await this.serviceService.create(dto);

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
  @ApiOperationWithRoles('Update a service')
  public async update(@Param('_id') _id: string, @Body() dto: UpdateServiceDto) {
    const result = await this.serviceService.update(_id, dto);

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
  @ApiOperationWithRoles('Delete a service')
  public async remove(@Param('_id') _id: string) {
    const result = await this.serviceService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
