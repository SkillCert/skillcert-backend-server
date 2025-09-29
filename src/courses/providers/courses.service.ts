import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DateRangeFilterDto } from '../../common/dto/date-range-filter.dto';
import { CategoriesService } from '../../categories/categories.service';
import { UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/providers/users.service';
import { CoursesRepository } from '../courses.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseResponseDto } from '../dto/course-response.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import type { Course } from '../entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Validate that the professor exists and has the right role
    const professor = await this.usersService.findById(
      createCourseDto.professorId,
    );
    if (
      professor.role !== UserRole.MODERATOR &&
      professor.role !== UserRole.ADMIN
    ) {
      throw new BadRequestException(
        'Only moderators and admins can be assigned as professors',
      );
    }

    // Validate category if provided
    if (createCourseDto.categoryId) {
      await this.categoriesService.findCategoryById(createCourseDto.categoryId);
    }

    // Check if course title already exists
    const titleExists = await this.coursesRepository.titleExists(
      createCourseDto.title,
    );
    if (titleExists) {
      throw new ConflictException('Course title already exists');
    }

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

  async findByProfessorId(professorId: string): Promise<Course[]> {
    if (!professorId) {
      throw new BadRequestException('Professor ID is required');
    }

    // Validate that the professor exists
    await this.usersService.findById(professorId);

    return await this.coursesRepository.findByProfessorId(professorId);
  }

  async findById(id: string): Promise<Course> {
    if (!id) {
      throw new BadRequestException('Course ID is required');
    }

    const course = await this.coursesRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    requestingUserId?: string,
  ): Promise<Course> {
    if (!id) {
      throw new BadRequestException('Course ID is required');
    }

    // Check if course exists
    const existingCourse = await this.coursesRepository.findById(id);
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // If a requesting user is provided, check ownership (professors can only update their own courses)
    if (requestingUserId) {
      const requestingUser = await this.usersService.findById(requestingUserId);
      if (
        requestingUser.role !== UserRole.ADMIN &&
        existingCourse.professorId !== requestingUserId
      ) {
        throw new ForbiddenException('You can only update your own courses');
      }
    }

    // If professor is being updated, validate the new professor
    if (updateCourseDto.professorId) {
      const professor = await this.usersService.findById(
        updateCourseDto.professorId,
      );
      if (
        professor.role !== UserRole.MODERATOR &&
        professor.role !== UserRole.ADMIN
      ) {
        throw new BadRequestException(
          'Only moderators and admins can be assigned as professors',
        );
      }
    }

    // If category is being updated, validate the new category
    if (updateCourseDto.categoryId) {
      await this.categoriesService.findCategoryById(updateCourseDto.categoryId);
    }

    // Check if title is being updated and if it already exists
    if (updateCourseDto.title) {
      const titleExists = await this.coursesRepository.titleExists(
        updateCourseDto.title,
        id,
      );
      if (titleExists) {
        throw new ConflictException('Course title already exists');
      }
    }

    const updatedCourse = await this.coursesRepository.update(
      id,
      updateCourseDto,
    );
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return updatedCourse;
  }

  async delete(id: string, requestingUserId?: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Course ID is required');
    }

    const existingCourse = await this.coursesRepository.findById(id);
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // If a requesting user is provided, check ownership (professors can only delete their own courses)
    if (requestingUserId) {
      const requestingUser = await this.usersService.findById(requestingUserId);
      if (
        requestingUser.role !== UserRole.ADMIN &&
        existingCourse.professorId !== requestingUserId
      ) {
        throw new ForbiddenException('You can only delete your own courses');
      }
    }

    const deleted = await this.coursesRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  async findByIdAndProfessor(id: string, professorId: string): Promise<Course> {
    if (!id || !professorId) {
      throw new BadRequestException('Course ID and Professor ID are required');
    }

    const course = await this.coursesRepository.findByIdAndProfessor(
      id,
      professorId,
    );
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${id} not found for professor ${professorId}`,
      );
    }

    return course;
  }

  async findByCategoryId(
    categoryId: string,
    filters?: DateRangeFilterDto,
  ): Promise<Course[]> {
    if (!categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    // Validate that the category exists
    await this.categoriesService.findCategoryById(categoryId);

    return await this.coursesRepository.findByCategoryId(categoryId, filters);
  }
}
