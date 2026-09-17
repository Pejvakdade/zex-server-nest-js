/** --------------------------------------------------------------------------------------------------------------------
 * @file abstractRepository.interface.ts
 * @fileOverview this file will represent interface of AbstractRepository
 * @author Arash Goharrostami
 * @interface IAbstractRepository
 */
import { DeleteResult, FindOptionsWhere, QueryRunner } from 'typeorm';

import {
  TFindOptions,
  TFindWithPaginationOptions,
  TFindWithPaginationResult,
} from '../type/findWithPagination.type';

export interface IAbstractRepository<TEntity> {
  countDocuments(filterQuery?: FindOptionsWhere<TEntity>): Promise<number>;
  create(entity: Omit<TEntity, '_id'>): Promise<TEntity>;
  insertMany(entities: Array<Omit<TEntity, '_id'>>): Promise<Array<TEntity>>;
  findOne(filterQuery: FindOptionsWhere<TEntity>, options?: TFindOptions<TEntity>): Promise<TEntity>;
  findById(_id: string, options?: TFindOptions<TEntity>): Promise<TEntity>;
  findByIdAndUpdate(_id: string, update: Partial<TEntity>): Promise<TEntity>;
  findOneAndUpdate(filterQuery: FindOptionsWhere<TEntity>, update: Partial<TEntity>): Promise<TEntity>;
  upsert(filterQuery: FindOptionsWhere<TEntity>, entity: Partial<TEntity>): Promise<TEntity>;
  find(filterQuery?: FindOptionsWhere<TEntity>, options?: TFindOptions<TEntity>): Promise<Array<TEntity>>;
  findWithPagination(
    filterQuery: FindOptionsWhere<TEntity>,
    options?: TFindWithPaginationOptions<TEntity>,
  ): Promise<TFindWithPaginationResult<TEntity>>;
  findByIdAndDelete(_id: string): Promise<TEntity>;
  deleteMany(filterQuery: FindOptionsWhere<TEntity>): Promise<DeleteResult>;
  startTransaction(): Promise<QueryRunner>;
}
