import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  private applyDateFilters(
    queryBuilder: SelectQueryBuilder<Course>,
    filters: DateRangeFilterDto,
  ): SelectQueryBuilder<Course> {
    if (filters.startDate) {
      queryBuilder.andWhere('course.createdAt >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('course.createdAt <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    return queryBuilder;
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(
    page?: number,
    limit?: number,
    filters?: DateRangeFilterDto,
  ): Promise<{ courses: Course[]; total: number }> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.professor', 'professor')
      .leftJoinAndSelect('course.category', 'category')
      .select([
        'course.id',
        'course.title',
        'course.description',
        'course.professorId',
        'course.categoryId',
        'course.createdAt',
        'course.updatedAt',
        'professor.id',
        'professor.name',
        'professor.email',
        'category.id',
        'category.name',
        'category.color',
      ])
      .orderBy('course.createdAt', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [courses, total] = await queryBuilder.getManyAndCount();
    return { courses, total };
  }

  async findByProfessorId(professorId: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { professorId },
      relations: ['professor', 'category'],
      select: {
        id: true,
        title: true,
        description: true,
        professorId: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          id: true,
          name: true,
          email: true,
        },
        category: {
          id: true,
          name: true,
          color: true,
        },
      },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return await this.courseRepository.findOne({
      where: { id },
      relations: ['professor', 'category'],
      select: {
        id: true,
        title: true,
        description: true,
        professorId: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          id: true,
          name: true,
          email: true,
        },
        category: {
          id: true,
          name: true,
          color: true,
        },
      },
    });
  }

  async findByIdOrThrow(id: string, onNotFound?: () => never): Promise<Course> {
    const course = await this.findById(id);
    if (course) {
      return course;
    }

    if (onNotFound) {
      return onNotFound();
    }

    throw new BadRequestException('cannot find course');
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course | null> {
    await this.courseRepository.update(id, updateCourseDto);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.courseRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.courseRepository.count({ where: { id } });
    return count > 0;
  }

  async findByIdAndProfessor(
    id: string,
    professorId: string,
  ): Promise<Course | null> {
    return await this.courseRepository.findOne({
      where: { id, professorId },
      relations: ['professor', 'category'],
      select: {
        id: true,
        title: true,
        description: true,
        professorId: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          id: true,
          name: true,
          email: true,
        },
        category: {
          id: true,
          name: true,
          color: true,
        },
      },
    });
  }

  async titleExists(title: string, excludeId?: string): Promise<boolean> {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .where('course.title = :title', { title });

    if (excludeId) {
      query.andWhere('course.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async findByCategoryId(
    categoryId: string,
    filters?: DateRangeFilterDto,
  ): Promise<Course[]> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.professor', 'professor')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.categoryId = :categoryId', { categoryId })
      .select([
        'course.id',
        'course.title',
        'course.description',
        'course.professorId',
        'course.categoryId',
        'course.createdAt',
        'course.updatedAt',
        'professor.id',
        'professor.name',
        'professor.email',
        'category.id',
        'category.name',
        'category.color',
      ])
      .orderBy('course.createdAt', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    return queryBuilder.getMany();
  }
}
