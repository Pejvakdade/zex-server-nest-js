/** --------------------------------------------------------------------------------------------------------------------
 * @file user.seeder.ts
 * @fileOverview inserts the default admin account so a fresh database is immediately usable.
 *               Idempotent: it never touches an existing account with the same email.
 */
import * as bcrypt from 'bcryptjs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '@src/app/user/domain/entities/user.entity';
import { UserNamespace } from '@src/app/user/namespace/user.namespace';
import { UserRepository } from '@src/app/user/domain/repositories/user.repository';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  public async seed(): Promise<void> {
    const email = this.configService.get<string>('DEFAULT_ADMIN_EMAIL');
    const password = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn('DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD not set — skipping admin seed');
      return;
    }

    if (await this.userRepository.findByEmail(email)) return;

    const firstName = this.configService.get<string>('DEFAULT_ADMIN_FIRST_NAME') || 'Zex';
    const lastName = this.configService.get<string>('DEFAULT_ADMIN_LAST_NAME') || 'Admin';

    await this.userRepository.create({
      fullName: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      userType: UserNamespace.EUserType.ADMIN,
      status: UserNamespace.EUserStatus.ACTIVE,
    } as UserEntity);

    this.logger.log(`Seeded default admin account: ${email}`);
  }
}
