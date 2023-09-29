import { EntityName } from '@/types/entityName.enum';
import { TraditionalAlbums } from '@entities/album.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Raw, Repository } from 'typeorm';
import { EntityTypeService } from '../entity-type/entity-type.service';
import { AlbumsDTO } from './dto/albums.dto';
import { SaveAlbumDTO } from './dto/save-album.dto';
import { OrderingDirection } from '@common/constants/order.constant';
import { AlbumFilter } from '@features/albums/dto/album-filter.dto';
import { FilesService } from '@features/files/files.service';
import { formatImageUrl } from '@utils/url';
import { PageableDTO } from '@common/dto/pageable.dto';
import { BaseService } from '@features/base/base.service';

@Injectable()
export class AlbumsService extends BaseService<TraditionalAlbums> {
  constructor(
    @InjectRepository(TraditionalAlbums)
    private readonly albumsRepository: Repository<TraditionalAlbums>,
    private readonly entityTypeService: EntityTypeService,
    private readonly filesService: FilesService,
  ) {
    super(albumsRepository, TraditionalAlbums);
  }

  insertMany(data: TraditionalAlbums[]) {
    return this.albumsRepository.save(data);
  }

  deleteMany(filter: FindOptionsWhere<TraditionalAlbums>) {
    return this.albumsRepository.delete(filter);
  }

  async getAll(filter: AlbumFilter, isAdmin = false) {
    const { orderBy, search, isActive, order, skip, size, categoryId, year } =
      filter;
    let where: FindOptionsWhere<TraditionalAlbums> = {
      entityType: {
        entityName: EntityName.TraditionAlbums,
        isActive: true,
      },
    };

    if (!isAdmin) {
      where = {
        ...where,
        isActive: true,
      };
    } else if (isAdmin && isActive !== undefined) {
      where = {
        ...where,
        isActive,
      };
    }

    if (filter.categoryId) {
      where.entityType = {
        ...(where.entityType as Record<string, unknown>),
        id: categoryId,
      };
    }

    if (filter.year) {
      where = {
        ...where,
        albumTime: Raw(
          (albumTime) => `extract(year from ${albumTime}) = :year`,
          {
            year: year,
          },
        ),
      };
    }

    if (filter.search) {
      where = {
        ...where,
        ftsTitle: Raw((title) => `${title} @@ websearch_to_tsquery(:search)`, {
          search: search,
        }),
      };
    }

    const [albums, albumsCount] = await this.findAll({
      relations: {
        entityType: true,
      },
      where: where,
      order: {
        [orderBy]: order,
      },
      skip: skip,
      take: size,
    });

    return new PageableDTO<AlbumsDTO>(
      albums.map((album) => new AlbumsDTO(album)),
      {
        pageOptionsDTO: filter,
        itemCount: albumsCount,
      },
    );
  }

  async getAlbumDetails(id: number) {
    const filter: FindOneOptions<TraditionalAlbums> = {
      relations: {
        entityType: true,
      },
      where: { id, isActive: true },
    };
    const album = await this.findOne(filter);
    if (!album) throw new NotFoundException(`Album ID ${id} is not exits.`);
    return new AlbumsDTO(album);
  }

  async saveAlbum(saveAlbumDTO: SaveAlbumDTO) {
    let album = await this.findById(saveAlbumDTO.id ?? -1);

    if (
      !album &&
      !saveAlbumDTO.thumbnailImage &&
      !saveAlbumDTO.thumbnailImageFile
    ) {
      throw new BadRequestException(
        'Empty both thumbnailImage and thumbnailImageFIle',
      );
    }

    if (
      (!album &&
        saveAlbumDTO.thumbnailImage &&
        saveAlbumDTO.thumbnailImageFile) ||
      (album &&
        saveAlbumDTO.thumbnailImage &&
        formatImageUrl(album.thumbnailImage) !== saveAlbumDTO.thumbnailImage &&
        saveAlbumDTO.thumbnailImageFile)
    )
      throw new ConflictException(
        'Please provide only one of the thumbnailImage or thumbnailImageFIle',
      );

    if (!album) {
      if (saveAlbumDTO.id)
        throw new NotFoundException(
          `Album ID ${saveAlbumDTO.categoryId} is not exist`,
        );
      album = this.create(saveAlbumDTO);
    }

    const entityType = await this.entityTypeService.findOne({
      where: {
        entityName: EntityName.TraditionAlbums,
        id: saveAlbumDTO.categoryId,
        isActive: true,
      },
    });

    if (!entityType)
      throw new BadRequestException(
        `Category ID ${saveAlbumDTO.categoryId} is not exist`,
      );

    saveAlbumDTO.entityTypeId = entityType.id;

    if (saveAlbumDTO.thumbnailImageFile) {
      saveAlbumDTO.thumbnailImage = await this.filesService.getImagesKeys(
        saveAlbumDTO.thumbnailImageFile,
        album?.thumbnailImage,
      );
    }

    album = await this.save({
      ...album,
      ...saveAlbumDTO,
    } as TraditionalAlbums);
    return album.id;
  }

  async getSearchFilter() {
    const albumCategory = this.entityTypeService.findMany({
      select: ['id', 'entityName', 'displayName', 'color'],
      where: {
        entityName: EntityName.TraditionAlbums,
        isActive: true,
      },
      order: {
        displayName: OrderingDirection.ASC,
      },
    });

    const albumYear = this.albumsRepository
      .createQueryBuilder('albums')
      .where('albums.isDeleted = :isDeleted', { isDeleted: false })
      .select('extract(year from albums.albumTime)', 'year')
      .groupBy('extract(year from albums.albumTime)')
      .orderBy({
        year: OrderingDirection.DESC,
      })
      .getRawMany();

    const [category, yearObjects] = await Promise.all([
      albumCategory,
      albumYear,
    ]);
    const year = yearObjects.map((yearObject) => Number(yearObject.year));
    return { category, year };
  }
}
