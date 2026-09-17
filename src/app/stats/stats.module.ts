import { Module } from '@nestjs/common';

import { ContactMessageModule } from '@src/app/contactMessage/contactMessage.module';
import { InvoiceModule } from '@src/app/invoice/invoice.module';
import { LicenseModule } from '@src/app/license/license.module';
import { LocationModule } from '@src/app/location/location.module';
import { PlanModule } from '@src/app/plan/plan.module';
import { ServiceModule } from '@src/app/service/service.module';
import { TicketModule } from '@src/app/ticket/ticket.module';
import { UsersModule } from '@src/app/user/user.module';

import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [
    LocationModule,
    UsersModule,
    PlanModule,
    LicenseModule,
    ContactMessageModule,
    ServiceModule,
    TicketModule,
    InvoiceModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
