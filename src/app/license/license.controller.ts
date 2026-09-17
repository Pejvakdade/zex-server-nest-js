/** --------------------------------------------------------------------------------------------------------------------
 * @file license.controller.ts
 * @fileOverview public licence list plus the admin dashboard's writes.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { CreateLicenseDto } from './dto/createLicense.dto';
import { LicenseService } from './license.service';
import { UpdateLicenseDto } from './dto/updateLicense.dto';

@ApiTags('License')
@Controller('license')
@UseGuards(GateKeeperGuard)
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  @ApiOperationWithRoles('List active software licences')
  public async find() {
    const result = await this.licenseService.findActive();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('admin/all')
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Every licence, inactive included, for the dashboard')
  public async findAllForAdmin() {
    const result = await this.licenseService.findAllForAdmin();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Create a licence')
  public async create(@Body() dto: CreateLicenseDto) {
    const result = await this.licenseService.create(dto);

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
  @ApiOperationWithRoles('Update a licence')
  public async update(@Param('_id') _id: string, @Body() dto: UpdateLicenseDto) {
    const result = await this.licenseService.update(_id, dto);

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
  @ApiOperationWithRoles('Delete a licence')
  public async remove(@Param('_id') _id: string) {
    const result = await this.licenseService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
