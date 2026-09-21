/** --------------------------------------------------------------------------------------------------------------------
 * @file user.controller.ts
 * @fileOverview auth surface (sign-up / sign-in public, `me` any role) plus the dashboard's account
 *               admin. `me` routes are declared before `:_id` so the param route cannot swallow them.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard, User } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ONLY, ADMIN_ROLES, ANY_SIGNED_IN } from '@src/values/constants';
import { DeclareApiParam } from '@src/values/apiParam';

import { CreateCustomerDto } from './dto/createCustomer.dto';
import { CreateStaffDto } from './dto/createStaff.dto';
import { GetUsersDto } from './dto/getUsers.dto';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { UpdateMeDto } from './dto/updateMe.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserService } from './user.service';

type TActor = { _id: string };

@ApiTags('User')
@Controller('user')
@UseGuards(GateKeeperGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Credential endpoints get a much tighter bucket than the global one: 10 attempts per minute per IP.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('sign-up')
  @ApiOperationWithRoles('Create a customer account')
  public async signUp(@Body() dto: SignUpDto) {
    const result = await this.userService.signUp(dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  /** A successful login creates nothing, so it answers 200 rather than POST's default 201. */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperationWithRoles('Log in and receive a JWT')
  public async signIn(@Body() dto: SignInDto) {
    const result = await this.userService.signIn(dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get('me')
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles('Resolve the signed-in account')
  public async me(@User() user: TActor) {
    const result = await this.userService.me(user._id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Patch('me')
  @AllowedRoles(ANY_SIGNED_IN)
  @ApiOperationWithRoles('Update the signed-in account (name, email, password)')
  public async updateMe(@User() user: TActor, @Body() dto: UpdateMeDto) {
    const result = await this.userService.updateMe(user._id, dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.UPDATE,
    };
  }

  @Get()
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('List accounts, filtered by type / status / search')
  public async find(@Query() query: GetUsersDto) {
    const result = await this.userService.findPaginated(query);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Post('staff')
  @AllowedRoles(ADMIN_ONLY)
  @ApiOperationWithRoles('Create an admin or staff console account')
  public async createStaff(@Body() dto: CreateStaffDto) {
    const result = await this.userService.createStaff(dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Post('customer')
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Create a customer account on their behalf (Admin → Customers)')
  public async createCustomer(@Body() dto: CreateCustomerDto) {
    const result = await this.userService.createCustomer(dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.CREATED],
      httpCode: HttpStatus.CREATED,
      statusCode: values.statusCode.SUCCESS.CREATE,
    };
  }

  @Patch(':_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ONLY)
  @ApiOperationWithRoles('Update an account (status, type, name, company)')
  public async update(@User() actor: TActor, @Param('_id') _id: string, @Body() dto: UpdateUserDto) {
    const result = await this.userService.updateById(actor._id, _id, dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.UPDATE,
    };
  }

  @Delete(':_id')
  @ApiParam(DeclareApiParam)
  @AllowedRoles(ADMIN_ONLY)
  @ApiOperationWithRoles('Delete an account')
  public async remove(@User() actor: TActor, @Param('_id') _id: string) {
    const result = await this.userService.removeById(actor._id, _id);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.DELETE,
    };
  }
}
