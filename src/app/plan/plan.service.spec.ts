/** --------------------------------------------------------------------------------------------------------------------
 * @file plan.service.spec.ts
 * @fileOverview the Redis cache around the public plan reads: hits skip Postgres, a broken Redis is
 *               invisible to the caller, and admin writes drop every cached list.
 */
import { PlanEntity } from './domain/entities/plan.entity';
import { PlanNamespace } from './namespace/plan.namespace';
import { PlanService } from './plan.service';

const product = PlanNamespace.EPlanProduct.VPS_HOSTING;

const plan = {
  _id: 'p1',
  product,
  name: 'Starter',
  price: '9.5',
  location: 'Frankfurt',
  specs: {},
} as unknown as PlanEntity;

describe('PlanService', () => {
  const repository = {
    findForProduct: jest.fn(),
    findLocationsForProduct: jest.fn(),
  };
  const redis = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
  const service = new PlanService(repository as never, redis as never);

  beforeEach(() => {
    jest.clearAllMocks();
    redis.set.mockResolvedValue('OK');
    redis.del.mockResolvedValue(1);
  });

  it('serves a cache hit without touching Postgres', async () => {
    redis.get.mockResolvedValue(JSON.stringify([{ _id: 'cached' }]));

    await expect(service.findForProduct(product)).resolves.toEqual([{ _id: 'cached' }]);
    expect(repository.findForProduct).not.toHaveBeenCalled();
  });

  it('on a miss reads Postgres, decorates the rows and warms the cache under product:location', async () => {
    redis.get.mockResolvedValue(null);
    repository.findForProduct.mockResolvedValue([plan]);

    const result = await service.findForProduct(product, 'Frankfurt');

    expect(result[0]).toMatchObject({ _id: 'p1', priceStr: '9.50' });
    expect(result[0].featureList).toEqual(expect.any(Array));
    expect(redis.set).toHaveBeenCalledWith(`plan:list:${product}:Frankfurt`, JSON.stringify(result), 300);
  });

  it('keys the un-filtered list as "all"', async () => {
    redis.get.mockResolvedValue(null);
    repository.findForProduct.mockResolvedValue([]);

    await service.findForProduct(product);

    expect(redis.get).toHaveBeenCalledWith(`plan:list:${product}:all`);
  });

  it('falls through to Postgres when Redis is down, on both the read and the write', async () => {
    redis.get.mockRejectedValue(new Error('ECONNREFUSED'));
    redis.set.mockRejectedValue(new Error('ECONNREFUSED'));
    repository.findForProduct.mockResolvedValue([plan]);

    await expect(service.findForProduct(product)).resolves.toHaveLength(1);
  });

  it('invalidateCache drops every product x (all + known + extra location) key', async () => {
    repository.findLocationsForProduct.mockResolvedValue(['Frankfurt']);

    await service.invalidateCache(['Tokyo']);

    const products = Object.values(PlanNamespace.EPlanProduct);
    expect(redis.del).toHaveBeenCalledTimes(products.length * 3);
    expect(redis.del).toHaveBeenCalledWith(`plan:list:${product}:all`);
    expect(redis.del).toHaveBeenCalledWith(`plan:list:${product}:Frankfurt`);
    expect(redis.del).toHaveBeenCalledWith(`plan:list:${product}:Tokyo`);
  });
});
