/** --------------------------------------------------------------------------------------------------------------------
 * @file health.service.spec.ts
 * @fileOverview one failing store must show up on its own, not take the whole check down with it.
 */
import { HealthService } from './health.service';

describe('HealthService', () => {
  const dataSource = { query: jest.fn() };
  const redis = { set: jest.fn() };
  const service = new HealthService(dataSource as never, redis as never);

  it('reports both stores ok', async () => {
    dataSource.query.mockResolvedValue([{ '?column?': 1 }]);
    redis.set.mockResolvedValue('OK');

    await expect(service.check()).resolves.toEqual({ postgres: 'ok', redis: 'ok' });
  });

  it('isolates a Redis failure and carries its message', async () => {
    dataSource.query.mockResolvedValue([]);
    redis.set.mockRejectedValue(new Error('connection closed'));

    await expect(service.check()).resolves.toEqual({ postgres: 'ok', redis: 'error: connection closed' });
  });

  it('isolates a Postgres failure the same way', async () => {
    dataSource.query.mockRejectedValue(new Error('ECONNREFUSED'));
    redis.set.mockResolvedValue('OK');

    await expect(service.check()).resolves.toEqual({ postgres: 'error: ECONNREFUSED', redis: 'ok' });
  });
});
