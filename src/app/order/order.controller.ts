/** --------------------------------------------------------------------------------------------------------------------
 * @file order.controller.ts
 * @fileOverview the customer's "Choose This Plan" button — the one endpoint that lets a client create
 *               a service for themselves.
 */
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard, User } from '@libs/gateKeeper';
import type { TActor } from '@src/common/actor';
import values from '@src/values';
import { CLIENT_ONLY } from '@src/values/constants';

import { CreateOrderDto } from './dto/createOrder.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('order')
@UseGuards(GateKeeperGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @AllowedRoles(CLIENT_ONLY)
  @ApiOperationWithRoles('Order a plan: provisions a service and issues its first invoice (auto-approved for now)')
  public async place(@User() actor: TActor, @Body() dto: CreateOrderDto) {
    const result = await this.orderService.place(actor, dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }
}
