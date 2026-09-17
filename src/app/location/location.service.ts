/** --------------------------------------------------------------------------------------------------------------------
 * @file location.service.ts
 * @fileOverview admin writes for datacenter locations.
 *
 * @description
 *   Locations are embedded in two other cached reads — plan lists (by city) and product content
 *   (flag/country resolved from the city) — so every write here flushes both, otherwise a renamed
 *   city would keep showing its old flag on the product pages for five minutes.
 */
import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';

import { PlanService } from '@src/app/plan/plan.service';
import { ProductContentService } from '@src/app/productContent/productContent.service';
import values from '@src/values';

import { CreateLocationDto } from './dto/createLocation.dto';
import { LocationEntity } from './domain/entities/location.entity';
import { LocationRepository } from './domain/repositories/location.repository';
import { UpdateLocationDto } from './dto/updateLocation.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    @Inject(forwardRef(() => PlanService))
    private readonly planService: PlanService,
    @Inject(forwardRef(() => ProductContentService))
    private readonly productContentService: ProductContentService,
  ) {}

  private notFound(): never {
    throw new NotFoundException({
      message: 'Location not found',
      statusCode: values.statusCode.ERROR.LOCATION.NOT_FOUND,
    });
  }

  /** Both dependent caches, best effort — a cache miss is never a failed write. */
  private async invalidateDependents(): Promise<void> {
    await this.planService.invalidateCache();
    await this.productContentService.invalidateAll();
  }

  public async findAllForAdmin(): Promise<Array<LocationEntity>> {
    return this.locationRepository.find({}, { sort: { sortOrder: 'ASC', city: 'ASC' } });
  }

  public async create(dto: CreateLocationDto): Promise<LocationEntity> {
    const created = await this.locationRepository.create(dto as LocationEntity);
    await this.invalidateDependents();
    return created;
  }

  public async update(_id: string, dto: UpdateLocationDto): Promise<LocationEntity> {
    const existing = await this.locationRepository.findById(_id);
    if (!existing) this.notFound();

    const updated = await this.locationRepository.findByIdAndUpdate(_id, dto as Partial<LocationEntity>);
    await this.invalidateDependents();
    return updated;
  }

  public async remove(_id: string): Promise<LocationEntity> {
    const removed = await this.locationRepository.findByIdAndDelete(_id);
    if (!removed) this.notFound();

    await this.invalidateDependents();
    return removed;
  }
}
