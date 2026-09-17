/** --------------------------------------------------------------------------------------------------------------------
 * @file contactMessage.controller.ts
 * @fileOverview receives public contact-form submissions; the inbox (list / status / delete) is
 *               staff-only, since a public list would leak every sender's name, email and message.
 */
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { ContactMessageEntity } from './domain/entities/contactMessage.entity';
import { ContactMessageRepository } from './domain/repositories/contactMessage.repository';
import { ContactMessageService } from './contactMessage.service';
import { CreateContactMessageDto } from './dto/createContactMessage.dto';
import { GetContactMessagesDto } from './dto/getContactMessages.dto';
import { UpdateContactMessageDto } from './dto/updateContactMessage.dto';

@ApiTags('ContactMessage')
@Controller('contact-message')
@UseGuards(GateKeeperGuard)
export class ContactMessageController {
  constructor(
    private readonly contactMessageRepository: ContactMessageRepository,
    private readonly contactMessageService: ContactMessageService,
  ) {}

  @Post()
  @ApiOperationWithRoles('Submit the public contact form')
  public async create(@Body() dto: CreateContactMessageDto) {
    const created = await this.contactMessageRepository.create(dto as ContactMessageEntity);

    return {
      // Only the id goes back — echoing the submission serves no purpose for the sender.
      result: { _id: created._id },
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Get()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('The inbox, newest first')
  public async find(@Query() query: GetContactMessagesDto) {
    const result = await this.contactMessageService.findPaginated(query);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Patch(':_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Mark a message read / archived / new')
  public async update(@Param('_id') _id: string, @Body() dto: UpdateContactMessageDto) {
    const result = await this.contactMessageService.updateStatus(_id, dto.status);

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
  @ApiOperationWithRoles('Delete a message')
  public async remove(@Param('_id') _id: string) {
    const result = await this.contactMessageService.remove(_id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
