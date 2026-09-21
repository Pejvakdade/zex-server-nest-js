import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

import { CreateCustomerDto } from '@src/app/user/dto/createCustomer.dto';
import { CreateStaffDto } from '@src/app/user/dto/createStaff.dto';
import { GetUsersDto } from '@src/app/user/dto/getUsers.dto';
import { SignInDto } from '@src/app/user/dto/signIn.dto';
import { SignUpDto } from '@src/app/user/dto/signUp.dto';
import { UpdateMeDto } from '@src/app/user/dto/updateMe.dto';
import { UpdateUserDto } from '@src/app/user/dto/updateUser.dto';

export interface IUserService {
  signIn(dto: SignInDto): Promise<UserNamespace.IAuthResult>;
  signUp(dto: SignUpDto): Promise<UserNamespace.IAuthResult>;
  me(_id: string): Promise<UserNamespace.IPublicUser>;
  updateMe(_id: string, dto: UpdateMeDto): Promise<UserNamespace.IPublicUser>;
  findPaginated(query: GetUsersDto): Promise<TFindWithPaginationResult<UserNamespace.IPublicUser>>;
  createStaff(dto: CreateStaffDto): Promise<UserNamespace.IPublicUser>;
  createCustomer(dto: CreateCustomerDto): Promise<UserNamespace.IPublicUser>;
  updateById(actorId: string, _id: string, dto: UpdateUserDto): Promise<UserNamespace.IPublicUser>;
  removeById(actorId: string, _id: string): Promise<UserNamespace.IPublicUser>;
}
