/** --------------------------------------------------------------------------------------------------------------------
 * @file ticket.controller.ts
 * @fileOverview customers open, read and reply to their own tickets; staff see everything and triage.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard, User } from '@libs/gateKeeper';
import type { TActor } from '@src/common/actor';
import values from '@src/values';
import { ADMIN_ROLES, ANY_SIGNED_IN } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { CreateTicketDto } from './dto/createTicket.dto';
import { GetTicketsDto } from './dto/getTickets.dto';
import { ReplyTicketDto } from './dto/replyTicket.dto';
import { TicketService } from './ticket.service';
import { UpdateTicketDto } from './dto/updateTicket.dto';

@ApiTags('Ticket')
@Controller('ticket')
@UseGuards(GateKeeperGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Every ticket, paginated, most recently active first')
  public async find(@Query() query: GetTicketsDto) {
    const result = await this.ticketService.findPaginated(query);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('me')
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles("The caller's own tickets")
  public async mine(@User() actor: TActor) {
    const result = await this.ticketService.findMine(actor._id);

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
  @ApiOperationWithRoles('One ticket with its replies — its owner or staff')
  public async findOne(@User() actor: TActor, @Param('_id') _id: string) {
    const result = await this.ticketService.findThreadFor(actor, _id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post()
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles('Open a ticket (staff may pass customerId to open one on their behalf)')
  public async create(@User() actor: TActor, @Body() dto: CreateTicketDto) {
    const result = await this.ticketService.create(actor, dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Post(':_id/reply')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles('Reply on a ticket — its owner or staff')
  public async reply(@User() actor: TActor, @Param('_id') _id: string, @Body() dto: ReplyTicketDto) {
    const result = await this.ticketService.reply(actor, _id, dto.text);

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
  @ApiOperationWithRoles('Change status / priority')
  public async update(@Param('_id') _id: string, @Body() dto: UpdateTicketDto) {
    const result = await this.ticketService.update(_id, dto);

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
  @ApiOperationWithRoles('Delete a ticket and its replies')
  public async remove(@Param('_id') _id: string) {
    const result = await this.ticketService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
