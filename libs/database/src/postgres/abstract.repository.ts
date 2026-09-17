/** --------------------------------------------------------------------------------------------------------------------
 * @file abstract.repository.ts
 * @tutorial only need to extend in your repository.
 * @description this file will share common repository methods for the project.
 * @createdBy Arash Goharrostami
 * @createdAt 2026-09-01 / Tuesday - September 01, 2026
 *
 * @note this is the Postgres/TypeORM counterpart of Miveh's Mongo AbstractRepository — the method
 *       names and signatures are kept intentionally identical so feature repositories read the same
 *       in both projects. `populate` maps to TypeORM `relations`, `sort` to `order`.
 */

import utils from './utils';

import { DataSource, DeleteResult, FindOptionsWhere, QueryRunner, Repository } from 'typeorm';

import { AbstractEntity } from './entity/abstract.entity';
import { IAbstractRepository } from './interface/abstractRepository.interface';
import {
  TFindOptions,
  TFindWithPaginationResult,
  TFindWithPaginationOptions,
} from './type/findWithPagination.type';

/** --------------------------------------------------------------------------------------------------------------------
 * @description class AbstractRepository for use abstract usage
 *
 * @class AbstractRepository
 * @protected constructor
 * @public countDocuments
 * @public create
 * @public insertMany
 * @public findOne
 * @public findById
 * @public findByIdAndUpdate
 * @public findOneAndUpdate
 * @public upsert
 * @public find
 * @public findWithPagination
 * @public findByIdAndDelete
 * @public deleteMany
 * @public startTransaction
 */
export abstract class AbstractRepository<TEntity extends AbstractEntity>
  implements IAbstractRepository<TEntity>
{
  /** ------------------------------------------------------------------------------------------------------------------
   * local Constructor
   * @const repository - Protected and readonly
   * @const dataSource - Private and readonly
   */
  protected constructor(
    protected readonly repository: Repository<TEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /** ------------------------------------------------------------------------------------------------------------------
   * @description Count total rows matching the filter.
   *
   * @async
   * @public
   * @method countDocuments
   * @returns {Promise<number>}
   */
  public async countDocuments(filterQuery?: FindOptionsWhere<TEntity>): Promise<number> {
    return this.repository.count(filterQuery ? { where: filterQuery } : {});
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for Abstract create
   *
   * @async
   * @method
   * @public
   * @param entity
   */
  public async create(entity: Omit<TEntity, '_id'>): Promise<TEntity> {
    const created = this.repository.create(entity as any);
    const result = await this.repository.save(created as any);
    return utils.normalize(result) as unknown as TEntity;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for Abstract insertMany
   *
   * @async
   * @method
   * @public
   * @param entities
   */
  public async insertMany(entities: Array<Omit<TEntity, '_id'>>): Promise<Array<TEntity>> {
    const created = this.repository.create(entities as any);
    const result = await this.repository.save(created as any);
    return utils.normalize(result) as unknown as Array<TEntity>;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for Abstract findOne
   *
   * @async
   * @method
   * @public
   */
  public async findOne(
    filterQuery: FindOptionsWhere<TEntity>,
    options: TFindOptions<TEntity> = {},
  ): Promise<TEntity> {
    const entity = await this.repository.findOne({
      where: filterQuery,
      relations: utils.toRelations(options.populate),
      select: utils.toSelect(options.select),
    });

    if (!entity) {
      console.warn('Row not found with filterQuery', filterQuery);
      // TODO :: ErrorHandler
      // throw new NotFoundException('Row not found.');
    }

    return utils.normalize(entity) as unknown as TEntity;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description
   *  Finds a single row by _id.
   *
   * @async
   * @method
   * @param { string } _id - The primary key to look up.
   * @param { TFindOptions } [options={}] - relation/select options.
   * @returns { Promise<TEntity> } The found row or null if not found.
   */
  public async findById(_id: string, options: TFindOptions<TEntity> = {}): Promise<TEntity> {
    const result = await this.repository.findOne({
      where: { _id } as unknown as FindOptionsWhere<TEntity>,
      relations: utils.toRelations(options.populate),
      select: utils.toSelect(options.select),
    });
    return utils.normalize(result) as unknown as TEntity;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description
   *  Finds a single row by _id and updates it.
   *
   * @async
   * @method
   * @param { string } _id
   * @param { Partial<TEntity> } update - The update to apply.
   */
  public async findByIdAndUpdate(_id: string, update: Partial<TEntity>): Promise<TEntity> {
    await this.repository.update(_id, update as any);
    return this.findById(_id);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for Abstract findOneAndUpdate
   *
   * @async
   * @method
   * @public
   */
  public async findOneAndUpdate(
    filterQuery: FindOptionsWhere<TEntity>,
    update: Partial<TEntity>,
  ): Promise<TEntity> {
    const existing = await this.repository.findOne({ where: filterQuery });

    if (!existing) {
      console.warn('Row not found with filterQuery:', filterQuery);
      // TODO :: ErrorHandler
      // throw new NotFoundException('Row not found.');
      return null;
    }

    await this.repository.update(existing._id, update as any);
    return this.findById(existing._id);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for public upsert
   *
   * @async
   * @method
   * @public
   */
  public async upsert(
    filterQuery: FindOptionsWhere<TEntity>,
    entity: Partial<TEntity>,
  ): Promise<TEntity> {
    const existing = await this.repository.findOne({ where: filterQuery });

    if (existing) {
      await this.repository.update(existing._id, entity as any);
      return this.findById(existing._id);
    }

    return this.create({ ...(filterQuery as object), ...(entity as object) } as Omit<TEntity, '_id'>);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for public find
   *
   * @async
   * @method
   * @public
   */
  public async find(
    filterQuery?: FindOptionsWhere<TEntity>,
    options: TFindOptions<TEntity> = {},
  ): Promise<Array<TEntity>> {
    const result = await this.repository.find({
      where: filterQuery,
      relations: utils.toRelations(options.populate),
      select: utils.toSelect(options.select),
      order: options.sort,
    });
    return utils.normalize(result) as unknown as Array<TEntity>;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for public findWithPagination
   *
   * @async
   * @method
   * @public
   * @param { FindOptionsWhere<TEntity> } filterQuery - The query to filter rows.
   * @param { TFindWithPaginationOptions } options - sort / page / limit / select / populate.
   * @returns { Promise<TFindWithPaginationResult<TEntity>> }
   */
  public async findWithPagination(
    filterQuery: FindOptionsWhere<TEntity>,
    options: TFindWithPaginationOptions<TEntity> = {},
  ): Promise<TFindWithPaginationResult<TEntity>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await this.repository.findAndCount({
      where: filterQuery,
      relations: utils.toRelations(options.populate),
      select: utils.toSelect(options.select),
      order: options.sort,
      skip,
      take: limit,
    });

    return {
      docs: utils.normalize(docs) as unknown as Array<TEntity>,
      totalDocs,
      limit,
      page,
      totalPages: Math.ceil(totalDocs / limit),
    };
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description
   *  Finds by _id and deletes the row.
   *
   * @async
   * @method
   * @param { string } _id
   * @returns { Promise<TEntity> } The deleted row or null if not found.
   */
  public async findByIdAndDelete(_id: string): Promise<TEntity> {
    const existing = await this.findById(_id);
    if (!existing) return null;
    await this.repository.delete(_id);
    return existing;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description
   *   method for find and delete many via filterQuery
   *
   * @async
   * @method
   * @param filterQuery
   * @return Promise<DeleteResult>
   */
  public async deleteMany(filterQuery: FindOptionsWhere<TEntity>): Promise<DeleteResult> {
    return this.repository.delete(filterQuery);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description method for public startTransaction
   *
   * @async
   * @method
   * @public
   * @note the caller owns the returned QueryRunner — it must `commitTransaction()` /
   *       `rollbackTransaction()` and then `release()` it.
   */
  public async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }
}
