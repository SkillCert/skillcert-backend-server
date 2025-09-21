import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  private toResponseDto(entity: Lesson): LessonResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      type: entity.type,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async create(createLessonDto: CreateLessonDto): Promise<LessonResponseDto> {
    const lesson = this.lessonRepository.create(createLessonDto);
    const saved = await this.lessonRepository.save(lesson);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<LessonResponseDto[]> {
    const lessons = await this.lessonRepository.find({
      relations: ['module'],
    });
    return lessons.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['module'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return this.toResponseDto(lesson);
  }

  async findByModuleId(moduleId: string): Promise<LessonResponseDto[]> {
    const lessons = await this.lessonRepository.find({
      where: { module_id: moduleId },
      order: { created_at: 'ASC' },
      skip,
      take: limit,
    });
    return lessons.map(this.toResponseDto);
  }
  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    const lesson = await this.findOne(id); // this already returns DTO
    const entity = await this.lessonRepository.findOne({ where: { id } });

    if (!entity) throw new NotFoundException(`Lesson with ID ${id} not found`);

    Object.assign(entity, updateLessonDto);
    const updated = await this.lessonRepository.save(entity);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException(`Lesson with ID ${id} not found`);
    await this.lessonRepository.remove(lesson);
  }
}
