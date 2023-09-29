import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { AuditEntity } from '@entities/base/audit.entity';
import { NotFoundException } from '@nestjs/common';
import { AutoIncrementEntity } from '@entities/base/auto-increment.entity';
import { UuidEntity } from '@entities/base/uuid.enitty';

export abstract class BaseService<
  T extends AuditEntity | AutoIncrementEntity | UuidEntity,
> {
  private readonly entityName: string;

  protected constructor(
    private readonly repository: Repository<T>,
    instance: new () => T,
  ) {
    this.entityName = instance.name;
  }

  async findAll(options: FindManyOptions<T>): Promise<[T[], number]> {
    return await this.repository.findAndCount(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    return await this.repository.findOne(options);
  }

  async findById(id: number | string): Promise<T> {
    return await this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  async saveAll(entities: T[]): Promise<T[]> {
    return await this.repository.save(entities);
  }

  create(dto: DeepPartial<T>): T {
    return this.repository.create(dto);
  }

  async deleteById(id: number | string, isThrow = false): Promise<void> {
    const entity = await this.findById(id);
    if (!entity && isThrow)
      throw new NotFoundException(`${this.entityName} ID ${id} is not exits.`);
    entity && (await this.delete(entity));
  }

  async delete(entity: T) {
    return await this.repository.softRemove(entity);
  }

  async permanentDelete(
    options: string | string[] | number | number[] | FindOptionsWhere<T>,
  ) {
    return await this.repository.delete(options);
  }

  async countBy(options: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    return await this.repository.countBy(options);
  }
}
