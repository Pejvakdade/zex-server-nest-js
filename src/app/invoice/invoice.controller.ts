/** --------------------------------------------------------------------------------------------------------------------
 * @file invoice.controller.ts
 * @fileOverview staff manage invoices; a customer sees only their own.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard, User } from '@libs/gateKeeper';
import type { TActor } from '@src/common/actor';
import values from '@src/values';
import { ADMIN_ROLES, ANY_SIGNED_IN } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { GetInvoicesDto } from './dto/getInvoices.dto';
import { InvoiceService } from './invoice.service';
import { UpdateInvoiceDto } from './dto/updateInvoice.dto';

@ApiTags('Invoice')
@Controller('invoice')
@UseGuards(GateKeeperGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Every invoice, paginated, with its customer')
  public async find(@Query() query: GetInvoicesDto) {
    const result = await this.invoiceService.findPaginated(query);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('me')
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles("The caller's own invoices")
  public async mine(@User() actor: TActor) {
    const result = await this.invoiceService.findMine(actor._id);

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
  @ApiOperationWithRoles('One invoice — its owner or staff')
  public async findOne(@User() actor: TActor, @Param('_id') _id: string) {
    const result = await this.invoiceService.findOneFor(actor, _id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Issue an invoice')
  public async create(@Body() dto: CreateInvoiceDto) {
    const result = await this.invoiceService.create(dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Patch(':_id/pay')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Mark an invoice paid')
  public async pay(@Param('_id') _id: string) {
    const result = await this.invoiceService.markPaid(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.UPDATE,
    };
  }

  @Patch(':_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Update an invoice')
  public async update(@Param('_id') _id: string, @Body() dto: UpdateInvoiceDto) {
    const result = await this.invoiceService.update(_id, dto);

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
  @ApiOperationWithRoles('Delete an invoice')
  public async remove(@Param('_id') _id: string) {
    const result = await this.invoiceService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
