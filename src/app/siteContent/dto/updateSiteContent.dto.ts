/** --------------------------------------------------------------------------------------------------------------------
 * @file updateSiteContent.dto.ts
 * @fileOverview admin edit payload for one page. The field set differs per page (see the seed
 *               data), so — as in the reference dashboard — the editor owns the shape and the API
 *               only insists on a JSON object.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateSiteContentDto {
  @ApiProperty({ type: Object, example: { heroHeading: 'We are here to help.' } })
  @IsObject()
  content: Record<string, unknown>;
}
