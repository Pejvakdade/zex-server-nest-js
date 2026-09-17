/** --------------------------------------------------------------------------------------------------------------------
 * @file health.controller.ts
 * @fileOverview GET /api/v1/health - liveness of the app plus its Postgres and Redis dependencies.
 */
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import values from '@src/values';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  public async check() {
    const result = await this.healthService.check();

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }
}
