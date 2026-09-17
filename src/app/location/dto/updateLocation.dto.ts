import { PartialType } from '@nestjs/swagger';

import { CreateLocationDto } from './createLocation.dto';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
