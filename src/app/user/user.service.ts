/** --------------------------------------------------------------------------------------------------------------------
 * @file user.service.ts
 * @fileOverview account creation, credential checking, JWT issuing, and the dashboard's account admin.
 */
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GateKeeperGuard } from '@libs/gateKeeper';
import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import values from '@src/values';

import { CreateStaffDto } from './dto/createStaff.dto';
import { GetUsersDto } from './dto/getUsers.dto';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { UpdateMeDto } from './dto/updateMe.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserEntity } from './domain/entities/user.entity';
import { UserNamespace } from './namespace/user.namespace';
import { UserRepository } from './domain/repositories/user.repository';
import { IUserService } from './interface/userService.interface';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly gateKeeperGuard: GateKeeperGuard,
    private readonly configService: ConfigService,
  ) {}

  /** ------------------------------------------------------------------------------------------------------------------
   * @description strips the password hash before anything leaves the service.
   */
  private sanitize(user: UserEntity): UserNamespace.IPublicUser {
    if (!user) return null;
    const { password, ...publicUser } = user;
    return publicUser;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description signs a JWT for an account.
   *
   * `keepLoggedIn` picks the long lifetime (JWT_MAX_TIME) over the short one (JWT_MIN_TIME) —
   * both env values carry a trailing `#1h` style comment, so parseInt trims it.
   */
  private async issueToken(user: UserEntity, keepLoggedIn = false): Promise<string> {
    const key = keepLoggedIn ? 'JWT_MAX_TIME' : 'JWT_MIN_TIME';
    const expiresIn = parseInt(this.configService.get<string>(key), 10);

    return this.gateKeeperGuard.jwtNewToken(
      { _id: user._id, userType: user.userType },
      { secret: this.configService.get<string>('JWT_SECRET_KEY'), expiresIn },
    );
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description creates a CLIENT account. Staff and admin accounts are created from the dashboard,
   *              never through this public route.
   */
  public async signUp(dto: SignUpDto): Promise<UserNamespace.IAuthResult> {
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException({
        message: 'An account with this email already exists',
        statusCode: values.statusCode.ERROR.USER.IS_DUPLICATED,
      });
    }

    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      company: dto.company,
      userType: UserNamespace.EUserType.CLIENT,
      status: UserNamespace.EUserStatus.ACTIVE,
    } as UserEntity);

    return { token: await this.issueToken(user), user: this.sanitize(user) };
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description checks credentials and issues a token.
   *
   * A missing account and a wrong password deliberately return the same error, so the endpoint
   * cannot be used to enumerate which email addresses have accounts.
   */
  public async signIn(dto: SignInDto): Promise<UserNamespace.IAuthResult> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);
    const matches = user && (await bcrypt.compare(dto.password, user.password));

    if (!matches) {
      throw new UnauthorizedException({
        message: 'Email or password is incorrect',
        statusCode: values.statusCode.ERROR.INVALID_CREDENTIALS,
      });
    }

    if (user.status === UserNamespace.EUserStatus.SUSPENDED) {
      throw new ForbiddenException({
        message: 'This account is suspended',
        statusCode: values.statusCode.ERROR.USER.IS_BLOCKED,
      });
    }

    return {
      token: await this.issueToken(user, dto.keepLoggedIn),
      user: this.sanitize(user),
    };
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description resolves the authenticated user from the id the guard put on the request.
   */
  public async me(_id: string): Promise<UserNamespace.IPublicUser> {
    const user = await this.userRepository.findById(_id);

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        statusCode: values.statusCode.ERROR.USER.NOT_FOUND,
      });
    }

    return this.sanitize(user);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description the Settings card. A password change must present the current password — a
   *              stolen-but-still-valid token should not be enough to lock the real owner out.
   */
  public async updateMe(_id: string, dto: UpdateMeDto): Promise<UserNamespace.IPublicUser> {
    const user = await this.userRepository.findById(_id);
    if (!user) this.notFound();

    const patch: Partial<UserEntity> = {};
    if (dto.fullName) patch.fullName = dto.fullName;

    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      await this.assertEmailFree(dto.email);
      patch.email = dto.email.toLowerCase();
    }

    if (dto.newPassword) {
      const withHash = await this.userRepository.findByEmailWithPassword(user.email);
      const matches = dto.currentPassword && (await bcrypt.compare(dto.currentPassword, withHash.password));

      if (!matches) {
        throw new UnauthorizedException({
          message: 'Current password is incorrect',
          statusCode: values.statusCode.ERROR.INVALID_CREDENTIALS,
        });
      }

      patch.password = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    }

    return this.sanitize(await this.userRepository.findByIdAndUpdate(_id, patch));
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description the dashboard's Customers and Staff tables (they differ only by `userType`).
   */
  public async findPaginated(query: GetUsersDto): Promise<TFindWithPaginationResult<UserNamespace.IPublicUser>> {
    const result = await this.userRepository.findPaginated(
      {
        userTypes: query.userType ? (query.userType.split(',') as Array<UserNamespace.EUserType>) : undefined,
        status: query.status,
        search: query.search,
      },
      query.page,
      query.limit,
    );

    return { ...result, docs: result.docs.map((user) => this.sanitize(user)) };
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description creates an ADMIN or STAFF console account. The DTO already refuses CLIENT.
   */
  public async createStaff(dto: CreateStaffDto): Promise<UserNamespace.IPublicUser> {
    await this.assertEmailFree(dto.email);

    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      userType: dto.userType,
      status: UserNamespace.EUserStatus.ACTIVE,
    } as UserEntity);

    return this.sanitize(user);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   * @description admin edit of someone else's account (status, type, name, company).
   *
   * An admin may not suspend or demote *themselves*: with a single admin that would lock the
   * console with nobody left who can reopen it.
   */
  public async updateById(actorId: string, _id: string, dto: UpdateUserDto): Promise<UserNamespace.IPublicUser> {
    const user = await this.userRepository.findById(_id);
    if (!user) this.notFound();

    const touchesOwnAccess =
      actorId === _id &&
      ((dto.status && dto.status !== user.status) || (dto.userType && dto.userType !== user.userType));

    if (touchesOwnAccess) this.cannotModifySelf();

    return this.sanitize(await this.userRepository.findByIdAndUpdate(_id, dto as Partial<UserEntity>));
  }

  public async removeById(actorId: string, _id: string): Promise<UserNamespace.IPublicUser> {
    if (actorId === _id) this.cannotModifySelf();

    const removed = await this.userRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    return this.sanitize(removed);
  }

  private async assertEmailFree(email: string): Promise<void> {
    if (await this.userRepository.findByEmail(email)) {
      throw new ConflictException({
        message: 'An account with this email already exists',
        statusCode: values.statusCode.ERROR.USER.IS_DUPLICATED,
      });
    }
  }

  private notFound(): never {
    throw new NotFoundException({
      message: 'User not found',
      statusCode: values.statusCode.ERROR.USER.NOT_FOUND,
    });
  }

  private cannotModifySelf(): never {
    throw new ForbiddenException({
      message: 'You cannot change your own access or delete your own account',
      statusCode: values.statusCode.ERROR.CANNOT_MODIFY_SELF,
    });
  }
}
