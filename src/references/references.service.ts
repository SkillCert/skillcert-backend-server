import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reference } from '../entities/reference.entity';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { ReferenceResponseDto } from './dto/reference-response.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';

@Injectable()
export class ReferencesService {
  constructor(
    @InjectRepository(Reference)
    private referencesRepository: Repository<Reference>,
  ) {}

  private toResponseDto(reference: Reference): ReferenceResponseDto {
    return {
      id: reference.id,
      title: reference.title,
      file_url: reference.file_url,
      type: reference.type,
      module: reference.module
        ? {
            id: reference.module.id,
            title: reference.module.title,
            description: reference.module.description,
            createdAt: reference.module.created_at,
            updatedAt: reference.module.updated_at,
          }
        : undefined,
      lesson: reference.lesson
        ? {
            id: reference.lesson.id,
            title: reference.lesson.title,
            content: reference.lesson.content,
            type: reference.lesson.type,
            createdAt: reference.lesson.created_at,
            updatedAt: reference.lesson.updated_at,
          }
        : undefined,
      createdAt: reference.created_at,
      updatedAt: reference.updated_at,
    };
  }

  async create(
    createReferenceDto: CreateReferenceDto,
  ): Promise<ReferenceResponseDto> {
    const reference = this.referencesRepository.create(createReferenceDto);
    const saved = await this.referencesRepository.save(reference);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ReferenceResponseDto[]> {
    const references = await this.referencesRepository.find({
      relations: ['module', 'lesson'],
    });
    return references.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<ReferenceResponseDto> {
    const reference = await this.referencesRepository.findOne({
      where: { id },
      relations: ['module', 'lesson'],
    });

    if (!reference) {
      throw new NotFoundException(`Reference with ID ${id} not found`);
    }

    return this.toResponseDto(reference);
  }

  async findByModule(moduleId: string): Promise<ReferenceResponseDto[]> {
    const references = await this.referencesRepository.find({
      where: { module_id: moduleId },
      relations: ['module', 'lesson'],
    });
    return references.map((ref) => this.toResponseDto(ref));
  }

  async findByLesson(lessonId: string): Promise<ReferenceResponseDto[]> {
    const references = await this.referencesRepository.find({
      where: { lesson_id: lessonId },
      relations: ['module', 'lesson'],
    });
    return references.map((ref) => this.toResponseDto(ref));
  }

  async update(
    id: string,
    updateReferenceDto: UpdateReferenceDto,
  ): Promise<ReferenceResponseDto> {
    const reference = await this.findOne(id);
    Object.assign(reference, updateReferenceDto);
    return await this.referencesRepository.save(reference);
  }

  async remove(id: string): Promise<void> {
    const result = await this.referencesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Reference with ID ${id} not found`);
    }
  }
}
