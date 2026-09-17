import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoiceModule } from '@src/app/invoice/invoice.module';
import { Phase6Seeder } from '@src/database/seeders/phase6.seeder';
import { ServiceModule } from '@src/app/service/service.module';
import { UsersModule } from '@src/app/user/user.module';

import { TicketController } from './ticket.controller';
import { TicketEntity } from './domain/entities/ticket.entity';
import { TicketReplyEntity } from './domain/entities/ticketReply.entity';
import { TicketReplyRepository } from './domain/repositories/ticketReply.repository';
import { TicketRepository } from './domain/repositories/ticket.repository';
import { TicketService } from './ticket.service';

@Module({
  /**
   * The phase-6 demo seeder writes users → services → invoices → tickets, so it lives in the module
   * at the end of that chain: every repository it needs is initialised by the time this module is.
   */
  imports: [TypeOrmModule.forFeature([TicketEntity, TicketReplyEntity]), UsersModule, ServiceModule, InvoiceModule],
  controllers: [TicketController],
  providers: [TicketRepository, TicketReplyRepository, TicketService, Phase6Seeder],
  exports: [TicketRepository, TicketReplyRepository, TicketService],
})
export class TicketModule implements OnModuleInit {
  constructor(private readonly phase6Seeder: Phase6Seeder) {}

  async onModuleInit(): Promise<void> {
    await this.phase6Seeder.seed();
  }
}
