import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContactMessageEntity } from './domain/entities/contactMessage.entity';
import { ContactMessageController } from './contactMessage.controller';
import { ContactMessageRepository } from './domain/repositories/contactMessage.repository';
import { ContactMessageService } from './contactMessage.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessageEntity])],
  controllers: [ContactMessageController],
  providers: [ContactMessageRepository, ContactMessageService],
  exports: [ContactMessageRepository, ContactMessageService],
})
export class ContactMessageModule {}
