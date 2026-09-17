import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '@src/common/dto/pagination.dto';
import { ContactMessageNamespace } from '../namespace/contactMessage.namespace';

export class GetContactMessagesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContactMessageNamespace.EStatus })
  @IsOptional()
  @IsEnum(ContactMessageNamespace.EStatus)
  status?: ContactMessageNamespace.EStatus;
}
