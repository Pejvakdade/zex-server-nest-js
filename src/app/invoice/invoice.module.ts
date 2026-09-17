import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceModule } from '@src/app/service/service.module';
import { UsersModule } from '@src/app/user/user.module';

import { InvoiceController } from './invoice.controller';
import { InvoiceEntity } from './domain/entities/invoice.entity';
import { InvoiceRepository } from './domain/repositories/invoice.repository';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity]), UsersModule, ServiceModule],
  controllers: [InvoiceController],
  providers: [InvoiceRepository, InvoiceService],
  exports: [InvoiceRepository, InvoiceService],
})
export class InvoiceModule {}
