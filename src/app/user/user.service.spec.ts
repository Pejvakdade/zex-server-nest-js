/** --------------------------------------------------------------------------------------------------------------------
 * @file user.service.spec.ts
 * @fileOverview account rules with the repository mocked: duplicate emails, credential checks,
 *               suspended accounts, token lifetimes, and the "never lock yourself out" guards.
 */
import * as bcrypt from 'bcryptjs';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';

import { UserEntity } from './domain/entities/user.entity';
import { UserNamespace } from './namespace/user.namespace';
import { UserService } from './user.service';

const password = 'Password123!';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  ({
    _id: 'u1',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: bcrypt.hashSync(password, 4),
    company: null,
    userType: UserNamespace.EUserType.CLIENT,
    status: UserNamespace.EUserStatus.ACTIVE,
    ...overrides,
  }) as UserEntity;

describe('UserService', () => {
  const repository = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };
  const gateKeeper = { jwtNewToken: jest.fn(async () => 'signed-token') };
  const config = {
    get: jest.fn((key: string) => ({ JWT_MIN_TIME: '3600#1h', JWT_MAX_TIME: '604800#7d', JWT_SECRET_KEY: 's' })[key]),
  };

  const service = new UserService(repository as never, gateKeeper as never, config as never);

  beforeEach(() => jest.clearAllMocks());

  describe('signUp', () => {
    it('refuses an email that already has an account', async () => {
      repository.findByEmail.mockResolvedValue(makeUser());

      await expect(
        service.signUp({ fullName: 'X', email: 'ADA@example.com', password } as never),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('creates a CLIENT with a hashed password and a lower-cased email, and never returns the hash', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockImplementation(async (data: UserEntity) => ({ _id: 'new', ...data }));

      const result = await service.signUp({ fullName: 'X', email: 'New@Example.com', password } as never);
      const created = repository.create.mock.calls[0][0] as UserEntity;

      expect(created.email).toBe('new@example.com');
      expect(created.userType).toBe(UserNamespace.EUserType.CLIENT);
      expect(created.password).not.toBe(password);
      expect(bcrypt.compareSync(password, created.password)).toBe(true);
      expect(result.token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('signIn', () => {
    it('answers the same 401 for an unknown email and for a wrong password', async () => {
      repository.findByEmailWithPassword.mockResolvedValueOnce(null);
      await expect(service.signIn({ email: 'nobody@x.com', password } as never)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      repository.findByEmailWithPassword.mockResolvedValueOnce(makeUser());
      await expect(service.signIn({ email: 'ada@example.com', password: 'wrong' } as never)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('refuses a suspended account even with the right password', async () => {
      repository.findByEmailWithPassword.mockResolvedValue(makeUser({ status: UserNamespace.EUserStatus.SUSPENDED }));

      await expect(service.signIn({ email: 'ada@example.com', password } as never)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('signs a short-lived token by default and the long one with keepLoggedIn', async () => {
      repository.findByEmailWithPassword.mockResolvedValue(makeUser());

      await service.signIn({ email: 'ada@example.com', password } as never);
      expect(gateKeeper.jwtNewToken).toHaveBeenLastCalledWith(
        { _id: 'u1', userType: 'client' },
        expect.objectContaining({ expiresIn: 3600 }),
      );

      await service.signIn({ email: 'ada@example.com', password, keepLoggedIn: true } as never);
      expect(gateKeeper.jwtNewToken).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ expiresIn: 604800 }));
    });
  });

  describe('updateMe', () => {
    it('requires the current password to set a new one', async () => {
      repository.findById.mockResolvedValue(makeUser());
      repository.findByEmailWithPassword.mockResolvedValue(makeUser());

      await expect(
        service.updateMe('u1', { newPassword: 'Another1!', currentPassword: 'wrong' } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(repository.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('self-protection', () => {
    it('does not let an admin suspend or demote their own account', async () => {
      repository.findById.mockResolvedValue(makeUser({ userType: UserNamespace.EUserType.ADMIN }));

      await expect(
        service.updateById('u1', 'u1', { status: UserNamespace.EUserStatus.SUSPENDED } as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.updateById('u1', 'u1', { userType: UserNamespace.EUserType.STAFF } as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('still lets an admin rename themselves', async () => {
      repository.findById.mockResolvedValue(makeUser({ userType: UserNamespace.EUserType.ADMIN }));
      repository.findByIdAndUpdate.mockResolvedValue(makeUser({ fullName: 'Renamed' }));

      await expect(service.updateById('u1', 'u1', { fullName: 'Renamed' } as never)).resolves.toMatchObject({
        fullName: 'Renamed',
      });
    });

    it('never deletes the acting account', async () => {
      await expect(service.removeById('u1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
      expect(repository.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
