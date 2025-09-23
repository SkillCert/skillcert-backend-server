import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseResponseDto } from './dto/course-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CoursesRepository } from './courses.repository';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';

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
    const { courses, total } = await this.coursesRepository.findAll(page, limit, filters);
    
    return {
      courses: courses.map(course => ({
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
        modules: course.modules?.map(module => ({
          id: module.id,
          title: module.title,
          createdAt: module.created_at,
          updatedAt: module.updated_at,
        })),
        category: course.category ? {
          id: course.category.id,
          name: course.category.name,
          description: course.category.description,
          color: course.category.color,
          isActive: course.category.isActive,
          createdAt: course.category.created_at,
          updatedAt: course.category.updated_at,
        } : null,
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
      modules: course.modules?.map(module => ({
        id: module.id,
        title: module.title,
        createdAt: module.created_at,
        updatedAt: module.updated_at,
      })),
      category: course.category ? {
        id: course.category.id,
        name: course.category.name,
        description: course.category.description,
        color: course.category.color,
        isActive: course.category.isActive,
        createdAt: course.category.created_at,
        updatedAt: course.category.updated_at,
      } : undefined,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      averageRating: course.acquireReviewAverageRating(),
    };    
  }

  async update(
    id: string,
    updateCourseDto: { title?: string; description?: string },
  ): Promise<CourseResponseDto> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    const updatedCourse = await this.courseRepository.save(course);

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
      modules: updatedCourse.modules?.map(module => ({
        id: module.id,
        title: module.title,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      })),
      category: updatedCourse.category ? {
        id: updatedCourse.category.id,
        name: updatedCourse.category.name,
        description: updatedCourse.category.description,
        color: updatedCourse.category.color,
        isActive: updatedCourse.category.isActive,
        createdAt: updatedCourse.category.createdAt,
        updatedAt: updatedCourse.category.updatedAt,
      } : undefined,
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt,
      averageRating: updatedCourse.acquireReviewAverageRating(),
    };    
  }  

  async remove(id: string): Promise<void> {
    const result = await this.courseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
