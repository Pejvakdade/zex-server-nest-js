/** --------------------------------------------------------------------------------------------------------------------
 * @file stats.controller.ts
 * @fileOverview public counters shown on marketing pages (no auth — the login page renders them)
 *               plus the staff-only dashboard overview.
 */
import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';

import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller('stats')
@UseGuards(GateKeeperGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('fleet')
  @ApiOperationWithRoles('Public fleet counters; a null metric has no data source yet')
  public async fleet() {
    const result = await this.statsService.fleet();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('overview')
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Dashboard overview counters; a null metric has no data source yet')
  public async overview() {
    const result = await this.statsService.overview();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }
}
