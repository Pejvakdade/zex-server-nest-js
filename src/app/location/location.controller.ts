/** --------------------------------------------------------------------------------------------------------------------
 * @file location.controller.ts
 * @fileOverview public active-location list plus the admin dashboard's writes.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { CreateLocationDto } from './dto/createLocation.dto';
import { LocationRepository } from './domain/repositories/location.repository';
import { LocationService } from './location.service';
import { UpdateLocationDto } from './dto/updateLocation.dto';

@ApiTags('Location')
@Controller('location')
@UseGuards(GateKeeperGuard)
export class LocationController {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly locationService: LocationService,
  ) {}

  @Get()
  @ApiOperationWithRoles('List active datacenter locations')
  public async find() {
    const result = await this.locationRepository.findActive();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('admin/all')
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Every location, inactive included, for the dashboard')
  public async findAllForAdmin() {
    const result = await this.locationService.findAllForAdmin();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Create a location')
  public async create(@Body() dto: CreateLocationDto) {
    const result = await this.locationService.create(dto);

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
  @ApiOperationWithRoles('Update a location')
  public async update(@Param('_id') _id: string, @Body() dto: UpdateLocationDto) {
    const result = await this.locationService.update(_id, dto);

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
  @ApiOperationWithRoles('Delete a location')
  public async remove(@Param('_id') _id: string) {
    const result = await this.locationService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
