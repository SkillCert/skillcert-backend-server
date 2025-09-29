import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';
import { CoursesRepository } from './courses.repository';
import { CourseResponseDto } from './dto/course-response.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly coursesRepository: CoursesRepository,
  ) {}

  async create(createCourseDto: {
    title: string;
    description?: string;
  }): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(
    page?: number,
    limit?: number,
    filters?: DateRangeFilterDto,
  ): Promise<{ courses: CourseResponseDto[]; total: number }> {
    const { courses, total } = await this.coursesRepository.findAll(
      page,
      limit,
      filters,
    );

    return {
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        professor: {
          id: course.professor.id,
          name: course.professor.name,
          email: course.professor.email,
          role: course.professor.role,
          createdAt: course.professor.createdAt,
          updatedAt: course.professor.updatedAt,
        },
        modules: course.modules?.map((module) => ({
          id: module.id,
          title: module.title,
          createdAt: module.created_at,
          updatedAt: module.updated_at,
        })),
        category: course.category
          ? {
              id: course.category.id,
              name: course.category.name,
              description: course.category.description,
              color: course.category.color,
              isActive: course.category.isActive,
              createdAt: course.category.created_at,
              updatedAt: course.category.updated_at,
            }
          : undefined,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        averageRating: course.acquireReviewAverageRating(),
      })),
      total,
    };
  }

  async findOne(id: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['modules', 'professor', 'category'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      professor: {
        id: course.professor.id,
        name: course.professor.name,
        email: course.professor.email,
        role: course.professor.role,
        createdAt: course.professor.createdAt,
        updatedAt: course.professor.updatedAt,
      },
      modules: course.modules?.map((module) => ({
        id: module.id,
        title: module.title,
        createdAt: module.created_at,
        updatedAt: module.updated_at,
      })),
      category: course.category
        ? {
            id: course.category.id,
            name: course.category.name,
            description: course.category.description,
            color: course.category.color,
            isActive: course.category.isActive,
            createdAt: course.category.created_at,
            updatedAt: course.category.updated_at,
          }
        : undefined,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      averageRating: course.acquireReviewAverageRating(),
    };
  }

  async update(
    id: string,
    updateCourseDto: { title?: string; description?: string },
  ): Promise<CourseResponseDto> {
    // Persist changes then reuse findOne for consistent mapping
    const existing = await this.courseRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    await this.courseRepository.update(id, updateCourseDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
