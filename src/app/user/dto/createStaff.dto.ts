import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

import { UserNamespace } from '../namespace/user.namespace';

/** Console accounts only — a CLIENT is created through the public sign-up, never here. */
export class CreateStaffDto {
  @ApiProperty({ example: 'Sam Rivera' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'sam@zexserver.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({ enum: [UserNamespace.EUserType.ADMIN, UserNamespace.EUserType.STAFF] })
  @IsIn([UserNamespace.EUserType.ADMIN, UserNamespace.EUserType.STAFF])
  userType: UserNamespace.EUserType;
}
