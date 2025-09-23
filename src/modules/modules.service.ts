import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DateRangeFilterDto, FilteredPaginationQueryDto } from '../common';
import { LessonResponseDto } from '../lessons/dto/lesson-response.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { ModuleResponseDto } from './dto/module-response.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Module, Module as ModuleEntity } from './entities/module.entity';

import { PaginatedModuleResponseDto } from './dto/paginated-module-response.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  private applyDateFilters(
    queryBuilder: SelectQueryBuilder<Module>,
    filters: DateRangeFilterDto,
  ): SelectQueryBuilder<Module> {
    if (filters.startDate) {
      queryBuilder.andWhere('module.created_at >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('module.created_at <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    return queryBuilder;
  }

  private toResponseDto(module: ModuleEntity): ModuleResponseDto {
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      lessons: module.lessons
        ? module.lessons.map(
            (lesson) =>
              ({
                id: lesson.id,
                title: lesson.title,
                content: lesson.content,
                type: lesson.type,
                createdAt: lesson.created_at,
                updatedAt: lesson.updated_at,
              }) as LessonResponseDto,
          )
        : [],
      createdAt: module.created_at,
      updatedAt: module.updated_at,
    };
  }

  async create(createModuleDto: CreateModuleDto): Promise<ModuleResponseDto> {
    const module = this.moduleRepository.create(createModuleDto);
    const saved = await this.moduleRepository.save(module);
    return this.toResponseDto(saved);
  }

  async findAll(
    pagination: FilteredPaginationQueryDto,
  ): Promise<PaginatedModuleResponseDto> {
    const { page = 1, limit = 20, startDate, endDate } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.moduleRepository
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.course', 'course')
      .leftJoinAndSelect('module.lessons', 'lessons')
      .orderBy('module.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (startDate || endDate) {
      this.applyDateFilters(queryBuilder, { startDate, endDate });
    }

    const [modules, total] = await queryBuilder.getManyAndCount();

    const items = modules.map(this.toResponseDto);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }

  async findOne(id: string): Promise<ModuleResponseDto> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['course', 'lessons'],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return this.toResponseDto(module);
  }

  async findByCourseId(
    courseId: string,
    pagination: FilteredPaginationQueryDto,
  ): Promise<PaginatedModuleResponseDto> {
    const { page = 1, limit = 20, startDate, endDate } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.moduleRepository
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.lessons', 'lessons')
      .where('module.course_id = :courseId', { courseId })
      .orderBy('module.created_at', 'ASC')
      .skip(skip)
      .take(limit);

    if (startDate || endDate) {
      this.applyDateFilters(queryBuilder, { startDate, endDate });
    }

    const [modules, total] = await queryBuilder.getManyAndCount();

    const items = modules.map(this.toResponseDto);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }

  async update(
    id: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    const module = await this.findOne(id);
    Object.assign(module, updateModuleDto);
    const updated = await this.moduleRepository.save(module as any);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    await this.moduleRepository.remove(module);
  }
}
