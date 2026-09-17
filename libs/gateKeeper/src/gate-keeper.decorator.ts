import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

export const AllowedRoles = (
    roles: Array<UserNamespace.EUserType>
) => applyDecorators(
    SetMetadata('roles', roles),
    ApiBearerAuth()
);
