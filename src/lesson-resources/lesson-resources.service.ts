import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LOCAL_FILE_STORAGE_SERVICE } from 'src/storage/constants';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  LessonResource,
  ResourceType,
} from '../entities/lesson-resource.entity';
import { FileStorageInterface } from '../storage/interfaces/file-storage.interface';
import { CentralizedLoggerService } from '../common/logger/services/centralized-logger.service';
import { LESSON_RESOURCES_PATH } from './constants';
import { LessonResourceResponseDto } from './dto/lesson-resource-response.dto';
import { CreateLessonResourceDto } from './dto/create-lesson-resource.dto';
import { UpdateLessonResourceDto } from './dto/update-lesson-resource.dto';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';

@Injectable()
export class LessonResourcesService {
  constructor(
    @InjectRepository(LessonResource)
    private readonly lessonResourceRepository: Repository<LessonResource>,
    @Inject(LOCAL_FILE_STORAGE_SERVICE)
    private readonly fileStorageService: FileStorageInterface,
    @Inject(CentralizedLoggerService)
    private readonly logger: CentralizedLoggerService,
  ) {
    this.logger.setContext(LessonResourcesService.name);
  }

  private applyDateFilters(
    queryBuilder: SelectQueryBuilder<LessonResource>,
    filters: DateRangeFilterDto,
  ): SelectQueryBuilder<LessonResource> {
    if (filters.startDate) {
      queryBuilder.andWhere('resource.created_at >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('resource.created_at <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    return queryBuilder;
  }

  private toResponseDto(resource: LessonResource): LessonResourceResponseDto {
    return {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      filename: resource.filename,
      originalName: resource.original_name,
      mimetype: resource.mimetype,
      size: resource.size,
      filePath: resource.file_path,
      fileUrl: resource.file_url,
      resourceType: resource.resource_type,
      lessonId: resource.lesson_id,
      downloadCount: resource.download_count,
      isActive: resource.is_active,
      createdAt: resource.created_at,
    };
  }

  async create(
    file: Express.Multer.File,
    fileUploadDto: CreateLessonResourceDto,
  ): Promise<LessonResourceResponseDto> {
    if (!file) { 
      throw new BadRequestException('No file provided'); 
    }
    const lessonResource = this.lessonResourceRepository.create(fileUploadDto);
    const saved = await this.lessonResourceRepository.save(lessonResource);
    return this.toResponseDto(saved);
  }

  async findAll(
    page?: number,
    limit?: number,
    filters?: DateRangeFilterDto,
  ): Promise<{ resources: LessonResourceResponseDto[]; total: number }> {
    const queryBuilder = this.lessonResourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.lesson', 'lesson')
      .where('resource.is_active = :isActive', { isActive: true })
      .orderBy('resource.created_at', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [resources, total] = await queryBuilder.getManyAndCount();
    return {
      resources: resources.map(this.toResponseDto),
      total,
    };
  }

  async findOne(id: string): Promise<LessonResourceResponseDto> {
    this.logger.debug(`Finding lesson resource by ID: ${id}`);
    
    const lessonResource = await this.lessonResourceRepository.findOne({
      where: { id, is_active: true },
      relations: ['lesson'],
    });

    if (!lessonResource) {
      this.logger.warn(`Lesson resource not found`, { resourceId: id });
      throw new NotFoundException(`Lesson resource with ID ${id} not found`);
    }

    return this.toResponseDto(lessonResource);
  }

  async findByLesson(
    lessonId: string,
    filters?: DateRangeFilterDto,
  ): Promise<LessonResourceResponseDto[]> {
    const queryBuilder = this.lessonResourceRepository
      .createQueryBuilder('resource')
      .where('resource.lesson_id = :lessonId', { lessonId })
      .andWhere('resource.is_active = :isActive', { isActive: true })
      .orderBy('resource.created_at', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    const resources = await queryBuilder.getMany();
    return resources.map(this.toResponseDto);
  }

  async findByResourceType(resourceType: ResourceType): Promise<LessonResourceResponseDto[]> {
    const resources = await this.lessonResourceRepository.find({
      where: { resource_type: resourceType, is_active: true },
      relations: ['lesson'],
      order: { created_at: 'DESC' },
    });
    return resources.map(this.toResponseDto);
  }

  async update(
    id: string,
    updateLessonResourceDto: UpdateLessonResourceDto,
  ): Promise<LessonResourceResponseDto> {
    const lessonResource = await this.findOne(id);
    Object.assign(lessonResource, updateLessonResourceDto);
    const saved = await this.lessonResourceRepository.save(lessonResource);
    return this.toResponseDto(saved);
  }



  // async create(
  //   file: Express.Multer.File,
  //   fileUploadDto: CreateLessonResourceDto,
  // ): Promise<LessonResource> {
  //   if (!file) {
  //     throw new BadRequestException('No file provided');
  //   }

  //   try {
  //     // Upload file using storage service
  //     const uploadResult = await this.fileStorageService.uploadFile(
  //       file,
  //       LESSON_RESOURCES_PATH,
  //     );

  //     // Determine resource type based on mimetype
  //     const resourceType = this.getResourceTypeFromMimetype(file.mimetype);

  //     // Create lesson resource record
  //     const lessonResource = this.lessonResourceRepository.create({
  //       title: fileUploadDto.title,
  //       description: fileUploadDto.description,
  //       filename: uploadResult.filename,
  //       original_name: uploadResult.originalName,
  //       mimetype: uploadResult.mimetype,
  //       size: uploadResult.size,
  //       file_path: uploadResult.path,
  //       file_url: uploadResult.url,
  //       resource_type: resourceType,
  //       lesson_id: fileUploadDto.lesson_id,
  //     });

  //     return await this.lessonResourceRepository.save(lessonResource);
  //   } catch (error: unknown) {
  //     const msg =
  //       error instanceof Error
  //         ? error.message
  //         : typeof error === 'string'
  //           ? error
  //           : 'Unknown error';

  //     throw new BadRequestException(`Resource creation failed: ${msg}`);
  //   }
  // }

  // async findAll(): Promise<LessonResource[]> {
  //   return await this.lessonResourceRepository.find({
  //     relations: ['lesson'],
  //     where: { is_active: true },
  //     order: { created_at: 'DESC' },
  //   });
  // }

  // async findOne(id: string): Promise<LessonResource> {
  //   const lessonResource = await this.lessonResourceRepository.findOne({
  //     where: { id, is_active: true },
  //     relations: ['lesson'],
  //   });

  //   if (!lessonResource) {
  //     throw new NotFoundException(`Lesson resource with ID ${id} not found`);
  //   }

  //   return lessonResource;
  // }

  // async findByLesson(lessonId: string): Promise<LessonResource[]> {
  //   return await this.lessonResourceRepository.find({
  //     where: { lesson_id: lessonId, is_active: true },
  //     order: { created_at: 'DESC' },
  //   });
  // }

  // async findByResourceType(
  //   resourceType: ResourceType,
  // ): Promise<LessonResource[]> {
  //   return await this.lessonResourceRepository.find({
  //     where: { resource_type: resourceType, is_active: true },
  //     relations: ['lesson'],
  //     order: { created_at: 'DESC' },
  //   });
  // }

  // async update(
  //   id: string,
  //   updateLessonResourceDto: UpdateLessonResourceDto,
  // ): Promise<LessonResource> {
  //   const lessonResource = await this.findOne(id);

  //   Object.assign(lessonResource, updateLessonResourceDto);
  //   return await this.lessonResourceRepository.save(lessonResource);
  // }

  async softDelete(id: string): Promise<void> {
    // Soft delete by setting is_active to false
    await this.lessonResourceRepository.update(id, { is_active: false });
  }

  async permanentDelete(id: string): Promise<void> {
    const lessonResource = await this.findOne(id);

    try {
      // Delete file from storage
      await this.fileStorageService.deleteFile(
        lessonResource.filename,
        LESSON_RESOURCES_PATH,
      );
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error';

      this.logger.error(
        `Failed to delete file during permanent delete of resource ${id}`,
        error instanceof Error ? error : new Error(msg),
        {
          resourceId: id,
          filename: lessonResource.filename,
          operation: 'permanentDelete',
        },
      );
    }

    // Permanently delete the record
    await this.lessonResourceRepository.delete(id);
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.lessonResourceRepository.increment({ id }, 'download_count', 1);
  }

  private getResourceTypeFromMimetype(mimetype: string): ResourceType {
    if (mimetype.startsWith('image/')) return ResourceType.IMAGE;
    if (mimetype.startsWith('video/')) return ResourceType.VIDEO;
    if (mimetype.startsWith('audio/')) return ResourceType.AUDIO;
    if (
      mimetype.includes('pdf') ||
      mimetype.includes('document') ||
      mimetype.includes('text') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('presentation')
    ) {
      return ResourceType.DOCUMENT;
    }
    if (mimetype.includes('zip') || mimetype.includes('rar')) {
      return ResourceType.ARCHIVE;
    }
    return ResourceType.OTHER;
  }
}
