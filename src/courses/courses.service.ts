import { Injectable, NotFoundException } from '@nestjs/common';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CoursesRepository } from './courses.repository';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.coursesRepository.create(createCourseDto);
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
    const course = await this.coursesRepository.findByIdOrThrow(id);

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
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const updatedCourse = await this.coursesRepository.update(
      id,
      updateCourseDto,
    );

    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const professorResponse: UserResponseDto = {
      id: updatedCourse.professor.id,
      name: updatedCourse.professor.name,
      email: updatedCourse.professor.email,
      role: updatedCourse.professor.role,
      createdAt: updatedCourse.professor.createdAt,
      updatedAt: updatedCourse.professor.updatedAt,
    };

    return {
      id: updatedCourse.id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      professor: professorResponse,
      modules: updatedCourse.modules?.map((module) => ({
        id: module.id,
        title: module.title,
        createdAt: module.created_at,
        updatedAt: module.updated_at,
      })),
      category: updatedCourse.category
        ? {
            id: updatedCourse.category.id,
            name: updatedCourse.category.name,
            description: updatedCourse.category.description,
            color: updatedCourse.category.color,
            isActive: updatedCourse.category.isActive,
            createdAt: updatedCourse.category.created_at,
            updatedAt: updatedCourse.category.updated_at,
          }
        : undefined,
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt,
      averageRating: updatedCourse.acquireReviewAverageRating(),
    };
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.coursesRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
