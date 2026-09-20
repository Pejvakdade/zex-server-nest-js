import { Module } from '@nestjs/common';

import { InvoiceModule } from '@src/app/invoice/invoice.module';
import { LicenseModule } from '@src/app/license/license.module';
import { PlanModule } from '@src/app/plan/plan.module';
import { ServiceModule } from '@src/app/service/service.module';
import { UsersModule } from '@src/app/user/user.module';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [UsersModule, PlanModule, ServiceModule, InvoiceModule, LicenseModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
