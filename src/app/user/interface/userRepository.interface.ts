import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { UserEntity } from '@src/app/user/domain/entities/user.entity';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity>;
  findByEmailWithPassword(email: string): Promise<UserEntity>;
  findPaginated(
    filter: { userTypes?: Array<UserNamespace.EUserType>; status?: UserNamespace.EUserStatus; search?: string },
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<UserEntity>>;
}
