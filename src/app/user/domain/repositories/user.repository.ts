/** --------------------------------------------------------------------------------------------------------------------
 * @file user.repository.ts
 * @fileOverview generic CRUD comes from AbstractRepository; only user-specific queries live here.
 */
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@libs/database/src/postgres';
import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '@src/app/user/interface/userRepository.interface';

@Injectable()
export class UserRepository extends AbstractRepository<UserEntity> implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity) repository: Repository<UserEntity>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description looks an account up by email **including the password hash**.
   *
   * The `password` column is declared `select: false`, so the inherited `findOne` deliberately
   * cannot see it. Sign-in is the one flow that needs it, hence this explicit escape hatch —
   * keep it out of any other code path.
   */
  public async findByEmailWithPassword(email: string): Promise<UserEntity> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description case-insensitive email lookup used to reject duplicate sign-ups.
   */
  public async findByEmail(email: string): Promise<UserEntity> {
    return this.repository.createQueryBuilder('user').where('LOWER(user.email) = LOWER(:email)', { email }).getOne();
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description the dashboard list. A query builder rather than `findWithPagination` because the
   *              free-text `search` needs an OR across three columns, which FindOptionsWhere
   *              cannot express alongside the AND filters.
   */
  public async findPaginated(
    filter: { userTypes?: Array<UserNamespace.EUserType>; status?: UserNamespace.EUserStatus; search?: string },
    page: number,
    limit: number,
  ): Promise<TFindWithPaginationResult<UserEntity>> {
    const qb = this.repository.createQueryBuilder('user').orderBy('user.createdAt', 'DESC');

    if (filter.userTypes?.length) qb.andWhere('user.userType IN (:...userTypes)', { userTypes: filter.userTypes });
    if (filter.status) qb.andWhere('user.status = :status', { status: filter.status });
    if (filter.search) {
      qb.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search OR user.company ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }

    const [docs, totalDocs] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { docs, totalDocs, limit, page, totalPages: Math.ceil(totalDocs / limit) };
  }
}
