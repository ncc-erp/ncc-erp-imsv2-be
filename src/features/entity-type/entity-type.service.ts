import { PageableDTO } from '@/common/dto/pageable.dto';
import { EntityType } from '@/entities/entityType.entity';
import { EntityName } from '@/types/entityName.enum';
import { generateNewId } from '@/utils/mapId';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import {
  FindManyOptions,
  FindOneOptions,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { CreateEntityTypeDTO } from './dto/create-entity-type.dto';
import { EntityTypeFilter } from './dto/entity-type-filter.dto';
import { EntityTypeDTO } from './dto/entity-type.dto';
import { UpdateEntityTypeDTO } from './dto/update-entity-type.dto';

@Injectable()
export class EntityTypeService {
  constructor(
    @InjectRepository(EntityType)
    private readonly repositoryEntityType: Repository<EntityType>,
  ) {}

  findOne(filter: FindOneOptions<EntityType>, includeInactive = false) {
    if (!includeInactive)
      filter.where = {
        ...filter.where,
        isActive: true,
      };
    return this.repositoryEntityType.findOne(filter);
  }

  findMany(filter: FindManyOptions<EntityType>, includeInactive = false) {
    if (!includeInactive)
      filter.where = {
        ...filter.where,
        isActive: true,
      };
    return this.repositoryEntityType.find(filter);
  }

  singleSave(entity: EntityType) {
    return this.repositoryEntityType.save(entity);
  }

  async getEntityType(id: number) {
    const entityType = await this.findOne(
      {
        where: { id },
      },
      true,
    );
    if (!entityType) throw new NotFoundException();
    return plainToClass(EntityTypeDTO, entityType);
  }

  async getEntityTypes(
    pageOptionsDTO: EntityTypeFilter,
    includeInactive = false,
  ) {
    const { orderBy, search, order, skip, size, entityName, isActive } =
      pageOptionsDTO;

    const filter: FindManyOptions<EntityType> = {
      where: {
        ...(entityName && { entityName: entityName }),
        displayName: ILike(`%${search ? search.trim() : ''}%`),
      },
      order: {
        ...(orderBy && { [orderBy]: order }),
      },
      skip: skip,
      take: size,
    };

    if (!includeInactive) {
      filter.where = { ...filter.where, isActive: true };
    } else if (includeInactive && isActive !== undefined) {
      filter.where = { ...filter.where, isActive };
    }

    const [entities, count] = await this.repositoryEntityType.findAndCount(
      filter,
    );
    const result = entities.map((entity) =>
      plainToClass(EntityTypeDTO, entity),
    );

    return new PageableDTO<EntityTypeDTO>(result, {
      itemCount: count,
      pageOptionsDTO,
    });
  }

  async updateEntityType(id: number, entityType: UpdateEntityTypeDTO) {
    const oldEntityType = await this.findOne(
      {
        where: { id },
      },
      true,
    );
    if (!oldEntityType) throw new NotFoundException();
    const result = await this.singleSave({
      ...oldEntityType,
      ...entityType,
    });
    return plainToClass(EntityTypeDTO, result);
  }

  async createEntityType(entityType: CreateEntityTypeDTO) {
    const idEntityTypes = await this.findMany({});
    const id = generateNewId(idEntityTypes.map((e) => e.id));
    const result = await this.repositoryEntityType.save({ id, ...entityType });
    return plainToClass(EntityTypeDTO, result);
  }

  async getCategories(categoryIds: EntityName[]) {
    const categories: EntityTypeDTO[] = await this.findMany({
      select: ['id', 'entityName', 'displayName', 'color'],
      where: {
        entityName: In(categoryIds),
      },
    });

    return categories;
  }
}
