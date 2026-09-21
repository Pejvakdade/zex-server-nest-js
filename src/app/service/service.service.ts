/** --------------------------------------------------------------------------------------------------------------------
 * @file service.service.ts
 * @fileOverview provisioned services: the admin table, a customer's own list, and the counters.
 */
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';

import { TFindWithPaginationResult } from '@libs/database/src/postgres/type/findWithPagination.type';
import { PlanNamespace } from '@src/app/plan/namespace/plan.namespace';
import type { TActor } from '@src/common/actor';
import { isStaff } from '@src/common/actor';
import values from '@src/values';

import { CreateServiceDto } from './dto/createService.dto';
import { GetServicesDto } from './dto/getServices.dto';
import { ServiceEntity } from './domain/entities/service.entity';
import { ServiceNamespace } from './namespace/service.namespace';
import { ServiceRepository } from './domain/repositories/service.repository';
import { UpdateServiceDto } from './dto/updateService.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  private notFound(): never {
    throw new NotFoundException({
      message: 'Service not found',
      statusCode: values.statusCode.ERROR.SERVICE.NOT_FOUND,
    });
  }

  private async assertUniqueId(serviceId: string, exceptId?: string): Promise<void> {
    const existing = await this.serviceRepository.findOne({ serviceId });
    if (existing && existing._id !== exceptId) {
      throw new ConflictException({
        message: `Service id ${serviceId} is already in use`,
        statusCode: values.statusCode.ERROR.SERVICE.IS_DUPLICATED,
      });
    }
  }

  public async findPaginated(query: GetServicesDto): Promise<TFindWithPaginationResult<ServiceEntity>> {
    return this.serviceRepository.findPaginated(
      { status: query.status, product: query.product, customerId: query.customerId, search: query.search },
      query.page,
      query.limit,
    );
  }

  /** The customer panel: everything the caller owns, soonest expiry first. */
  public async findMine(customerId: string): Promise<Array<ServiceEntity>> {
    return this.serviceRepository.find({ customerId }, { sort: { expiresAt: 'ASC' } });
  }

  /** One row — its owner or staff; anyone else gets a 403 rather than a 404 that leaks existence. */
  public async findOneFor(actor: TActor, _id: string): Promise<ServiceEntity> {
    const service = await this.serviceRepository.findById(_id, { populate: ['customer'] });
    if (!service) this.notFound();

    if (!isStaff(actor) && service.customerId !== actor._id) {
      throw new ForbiddenException({
        message: 'This service belongs to another account',
        statusCode: values.statusCode.ERROR.SERVICE.FORBIDDEN_NOT_OWNER,
      });
    }

    return service;
  }

  /** The next free human id for a product, e.g. VPS-1043 — used when a customer orders a plan. */
  public async nextServiceId(product: PlanNamespace.EPlanProduct): Promise<string> {
    const prefix = ServiceNamespace.ID_PREFIX[product];
    const max = await this.serviceRepository.maxNumberForPrefix(prefix);
    return `${prefix}-${Math.max(max + 1, ServiceNamespace.FIRST_NUMBER)}`;
  }

  public async create(dto: CreateServiceDto): Promise<ServiceEntity> {
    await this.assertUniqueId(dto.serviceId);
    return this.serviceRepository.create(dto as unknown as ServiceEntity);
  }

  public async update(_id: string, dto: UpdateServiceDto): Promise<ServiceEntity> {
    const existing = await this.serviceRepository.findById(_id);
    if (!existing) this.notFound();
    if (dto.serviceId) await this.assertUniqueId(dto.serviceId, _id);

    return this.serviceRepository.findByIdAndUpdate(_id, dto as unknown as Partial<ServiceEntity>);
  }

  public async remove(_id: string): Promise<ServiceEntity> {
    const removed = await this.serviceRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    return removed;
  }

  /** Running + Active — the fleet's "servers" and the overview's "active services". */
  public async countLive(): Promise<number> {
    return this.serviceRepository.countDocuments({ status: In(ServiceNamespace.LIVE_STATUSES) });
  }

  /** Most recently provisioned first, customer populated — feeds the dashboard's Recent activity. */
  public async recent(limit: number): Promise<Array<ServiceEntity>> {
    const { docs } = await this.serviceRepository.findWithPagination(
      {},
      { page: 1, limit, sort: { createdAt: 'DESC' }, populate: ['customer'] },
    );
    return docs;
  }
}
