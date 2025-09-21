import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
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
    pagination: PaginationQueryDto,
  ): Promise<PaginatedModuleResponseDto> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [modules, total] = await this.moduleRepository.findAndCount({
      relations: ['course', 'lessons'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

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
    pagination: PaginationQueryDto,
  ): Promise<PaginatedModuleResponseDto> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [modules, total] = await this.moduleRepository.findAndCount({
      where: { course_id: courseId },
      relations: ['lessons'],
      order: { created_at: 'ASC' },
      skip,
      take: limit,
    });

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
