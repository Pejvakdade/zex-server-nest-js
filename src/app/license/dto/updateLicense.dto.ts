import { PartialType } from '@nestjs/swagger';

import { CreateLicenseDto } from './createLicense.dto';

export class UpdateLicenseDto extends PartialType(CreateLicenseDto) {}
