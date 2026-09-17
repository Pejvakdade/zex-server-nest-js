import { PartialType } from '@nestjs/swagger';

import { CreateServiceDto } from './createService.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
