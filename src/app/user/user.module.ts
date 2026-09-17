import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSeeder } from '@src/database/seeders/user.seeder';

import { UserEntity } from './domain/entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './domain/repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserSeeder],
  exports: [UserService, UserRepository],
})
export class UsersModule implements OnModuleInit {
  constructor(private readonly userSeeder: UserSeeder) {}

  async onModuleInit(): Promise<void> {
    await this.userSeeder.seed();
  }
}
