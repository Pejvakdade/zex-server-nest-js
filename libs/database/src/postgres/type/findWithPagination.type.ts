/** --------------------------------------------------------------------------------------------------------------------
 * @file findWithPagination.type.ts
 * @fileOverview shared option/result shapes for AbstractRepository read methods.
 */
import { FindOptionsOrder, FindOptionsRelations, FindOptionsSelect } from 'typeorm';

export type TFindOptions<TEntity = any> = {
  select?: FindOptionsSelect<TEntity> | Array<keyof TEntity>;
  populate?: FindOptionsRelations<TEntity> | Array<string> | string;
  sort?: FindOptionsOrder<TEntity>;
};

export type TFindWithPaginationOptions<TEntity = any> = TFindOptions<TEntity> & {
  page?: number;
  limit?: number;
};

export type TFindWithPaginationResult<TEntity> = {
  docs: Array<TEntity>;
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
};
