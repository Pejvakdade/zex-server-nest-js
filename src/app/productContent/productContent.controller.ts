/** --------------------------------------------------------------------------------------------------------------------
 * @file productContent.controller.ts
 * @fileOverview public product-page content plus the admin editor's raw read and write.
 */
import { Body, Controller, Get, HttpStatus, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';

import { ProductContentService } from './productContent.service';
import { UpdateProductContentDto } from './dto/updateProductContent.dto';

@ApiTags('ProductContent')
@Controller('product-content')
@UseGuards(GateKeeperGuard)
export class ProductContentController {
  constructor(private readonly productContentService: ProductContentService) {}

  @Get(':product')
  @ApiParam({ name: 'product', example: 'VPS Hosting' })
  @ApiOperationWithRoles('Editorial content for one product page')
  public async findByProduct(@Param('product') product: string) {
    const result = await this.productContentService.findByProduct(product);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Get(':product/raw')
  @ApiParam({ name: 'product', example: 'VPS Hosting' })
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('The stored row, location cities unresolved, for the editor')
  public async findRawByProduct(@Param('product') product: string) {
    const result = await this.productContentService.findRawByProduct(product);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Patch(':product')
  @ApiParam({ name: 'product', example: 'VPS Hosting' })
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles('Update one product page')
  public async update(@Param('product') product: string, @Body() dto: UpdateProductContentDto) {
    const result = await this.productContentService.update(product, dto);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.UPDATE,
    };
  }
}
