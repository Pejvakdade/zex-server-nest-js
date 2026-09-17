import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ContactMessageNamespace } from '../namespace/contactMessage.namespace';

/** The only thing staff change on a message is where it sits in the inbox. */
export class UpdateContactMessageDto {
  @ApiProperty({ enum: ContactMessageNamespace.EStatus })
  @IsEnum(ContactMessageNamespace.EStatus)
  status: ContactMessageNamespace.EStatus;
}
