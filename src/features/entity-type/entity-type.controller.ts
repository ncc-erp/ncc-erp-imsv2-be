import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { Mission } from '@/types/authorization/mission.enum';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Action } from '@type/authorization/action.enum';
import { CreateEntityTypeDTO } from './dto/create-entity-type.dto';
import { EntityTypeFilter } from './dto/entity-type-filter.dto';
import { EntityTypeDTO } from './dto/entity-type.dto';
import { UpdateEntityTypeDTO } from './dto/update-entity-type.dto';
import { EntityTypeService } from './entity-type.service';
import { ApiPaginatedResponse } from '@/common/decorators/paginated-response.decorator';

@ApiTags('Entity Type')
@RequireMission(Mission.ENTITY_TYPE)
@Controller('entity-type')
@ApiBearerAuth()
export class EntityTypeController {
  constructor(private readonly entityTypeService: EntityTypeService) {}

  /*
   * Get all active entity types
   */
  @PermitActions(Action.READ)
  @ApiPaginatedResponse({
    model: EntityTypeDTO,
  })
  @Get()
  async getEntityTypes(@Query() query: EntityTypeFilter) {
    return this.entityTypeService.getEntityTypes(query);
  }

  /*
   * Get all entity types (including inactive ones)
   */
  @PermitActions(Action.MANAGE)
  @ApiPaginatedResponse({ model: EntityTypeDTO })
  @Get('all')
  async getAllEntityTypes(@Query() query: EntityTypeFilter) {
    return this.entityTypeService.getEntityTypes(query, true);
  }

  /*
   * Create entity types
   */
  @PermitActions(Action.MANAGE)
  @ApiBody({ type: CreateEntityTypeDTO })
  @Post()
  async createEntityType(@Body() newEntityType: CreateEntityTypeDTO) {
    return this.entityTypeService.createEntityType(newEntityType);
  }

  /*
   * Get entity type by id
   */
  @PermitActions(Action.READ)
  @ApiResponse({ type: EntityTypeDTO })
  @Get(':id')
  async getEntityType(@Param('id') id: number): Promise<EntityTypeDTO> {
    return this.entityTypeService.getEntityType(id);
  }

  /*
   * Update entity types
   */
  @PermitActions(Action.MANAGE)
  @ApiBody({ type: UpdateEntityTypeDTO })
  @Put(':id')
  async updateEntityType(
    @Param('id') id: number,
    @Body() entityType: UpdateEntityTypeDTO,
  ) {
    return this.entityTypeService.updateEntityType(id, entityType);
  }
}
