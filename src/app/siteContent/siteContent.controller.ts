/** --------------------------------------------------------------------------------------------------------------------
 * @file siteContent.controller.ts
 * @fileOverview public page content plus the admin editor's write.
 */
import { Body, Controller, Get, HttpStatus, Param, ParseEnumPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AllowedRoles, ApiOperationWithRoles, GateKeeperGuard } from '@libs/gateKeeper';
import values from '@src/values';
import { ADMIN_ROLES } from '@src/values/constants';

import { SiteContentNamespace } from './namespace/siteContent.namespace';
import { SiteContentService } from './siteContent.service';
import { UpdateSiteContentDto } from './dto/updateSiteContent.dto';

@ApiTags('SiteContent')
@Controller('site-content')
@UseGuards(GateKeeperGuard)
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  @Get(':page')
  @ApiParam({ name: 'page', enum: SiteContentNamespace.EPage })
  @ApiOperationWithRoles('Editorial content for one site page')
  public async findByPage(
    @Param('page', new ParseEnumPipe(SiteContentNamespace.EPage)) page: SiteContentNamespace.EPage,
  ) {
    const result = await this.siteContentService.findByPage(page);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.OK,
    };
  }

  @Patch(':page')
  @ApiParam({ name: 'page', enum: SiteContentNamespace.EPage })
  @AllowedRoles(ADMIN_ROLES)
  @ApiOperationWithRoles("Replace one site page's content")
  public async update(@Param('page') page: SiteContentNamespace.EPage, @Body() dto: UpdateSiteContentDto) {
    const result = await this.siteContentService.update(page, dto.content);

    return {
      result,
      message: values.httpCodeMessage[HttpStatus.OK],
      httpCode: HttpStatus.OK,
      statusCode: values.statusCode.SUCCESS.UPDATE,
    };
  }
}
