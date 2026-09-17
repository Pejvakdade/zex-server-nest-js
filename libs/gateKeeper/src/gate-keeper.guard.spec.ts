/** --------------------------------------------------------------------------------------------------------------------
 * @file gate-keeper.guard.spec.ts
 * @fileOverview the JWT guard in isolation: a real JwtService signs the tokens, so the checks run
 *               against genuine signatures / expiries rather than mocked decode results.
 */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { GateKeeperGuard } from './gate-keeper.guard';

const SECRET = 'unit-test-secret';

/** Builds the slice of ExecutionContext the guard touches: the handler's roles and the request. */
const contextFor = (roles: Array<string> | undefined, headers: Record<string, string> = {}) => {
  const request: Record<string, unknown> = { headers };
  const context = {
    getHandler: () => 'handler',
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { context, request };
};

describe('GateKeeperGuard', () => {
  const jwt = new JwtService({ secret: SECRET });
  const reflector = { get: jest.fn() } as unknown as Reflector;
  const config = { get: jest.fn(() => SECRET) } as unknown as ConfigService;
  const guard = new GateKeeperGuard(reflector, config, jwt);

  const rolesOnHandler = (roles: Array<string> | undefined) => (reflector.get as jest.Mock).mockReturnValue(roles);
  const tokenFor = (userType: string, expiresIn = 3600) => jwt.sign({ _id: 'u1', userType }, { expiresIn });

  it('lets a public route (no roles) through without a header', async () => {
    rolesOnHandler(undefined);
    const { context } = contextFor(undefined);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('still decodes an optional token on a public route so handlers can see who is asking', async () => {
    rolesOnHandler([]);
    const { context, request } = contextFor([], { authorization: `Bearer ${tokenFor('client')}` });

    await guard.canActivate(context);

    expect(request._id).toBe('u1');
    expect(request.userType).toBe('client');
  });

  it('rejects a guarded route with no authorization header', async () => {
    rolesOnHandler(['admin']);
    const { context } = contextFor(['admin']);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a non-Bearer scheme', async () => {
    rolesOnHandler(['admin']);
    const { context } = contextFor(['admin'], { authorization: `Basic ${tokenFor('admin')}` });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token signed with another secret', async () => {
    rolesOnHandler(['admin']);
    const forged = new JwtService({ secret: 'someone-else' }).sign({ _id: 'u1', userType: 'admin' });
    const { context } = contextFor(['admin'], { authorization: `Bearer ${forged}` });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { message: 'Invalid authorization token' },
    });
  });

  it('rejects an expired token', async () => {
    rolesOnHandler(['admin']);
    const { context } = contextFor(['admin'], { authorization: `Bearer ${tokenFor('admin', -10)}` });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { message: 'Authorization token has expired' },
    });
  });

  it('rejects a valid token whose role is not allowed', async () => {
    rolesOnHandler(['admin', 'staff']);
    const { context } = contextFor(['admin', 'staff'], { authorization: `Bearer ${tokenFor('client')}` });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { message: expect.stringContaining('Access denied with client role') },
    });
  });

  it('admits an allowed role and stamps the caller onto the request', async () => {
    rolesOnHandler(['admin', 'staff']);
    const { context, request } = contextFor(['admin', 'staff'], { authorization: `Bearer ${tokenFor('staff')}` });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toMatchObject({ _id: 'u1', userType: 'staff' });
  });
});
