import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DateRangeFilterDto } from '../../common/dto/date-range-filter.dto';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import {
  EnrollmentResponseDto,
  UserEnrollmentsResponseDto,
} from '../dto/enrollment-response.dto';
import { Enrollment } from '../entities/enrollment.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  private toResponseDto(enrollment: Enrollment): EnrollmentResponseDto {
    return {
      id: enrollment.id,
      userId: enrollment.user.id,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course?.title,
      enrolledAt: enrollment.enrolledAt,
      isActive: enrollment.isActive,
    };
  }

  private applyDateFilters(
    queryBuilder: SelectQueryBuilder<Enrollment>,
    filters: DateRangeFilterDto,
  ): SelectQueryBuilder<Enrollment> {
    if (filters.startDate) {
      queryBuilder.andWhere('enrollment.enrolledAt >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('enrollment.enrolledAt <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    return queryBuilder;
  }

  async enroll(dto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const course = await this.courseRepo.findOne({
      where: { id: dto.courseId },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!course) throw new NotFoundException('Course not found');

    const enrollment = this.enrollmentRepo.create({ user, course });
    const saved = await this.enrollmentRepo.save(enrollment);

    // reload with relations so DTO has course/user
    const full = await this.enrollmentRepo.findOne({
      where: { id: saved.id },
      relations: ['user', 'course'],
    });
    if (!full) {
      throw new NotFoundException(`Enrollment with id ${saved.id} not found`);
    }

    return this.toResponseDto(full);
  }

  async getUserEnrollments(
    userId: string,
    filters?: DateRangeFilterDto,
  ): Promise<UserEnrollmentsResponseDto> {
    const queryBuilder = this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('enrollment.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('enrollment.enrolledAt', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    const enrollments = await queryBuilder.getMany();

    return {
      userId,
      enrollments: enrollments.map(this.toResponseDto),
    };
  }

  async findAll(
    page?: number,
    limit?: number,
    filters?: DateRangeFilterDto,
  ): Promise<{ enrollments: EnrollmentResponseDto[]; total: number }> {
    const queryBuilder = this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoinAndSelect('enrollment.course', 'course')
      .orderBy('enrollment.enrolledAt', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [enrollments, total] = await queryBuilder.getManyAndCount();
    return {
      enrollments: enrollments.map(this.toResponseDto),
      total,
    };
  }

  async removeEnrollment(enrollmentId: string): Promise<{ message: string }> {
    await this.enrollmentRepo.delete(enrollmentId);
    return { message: `Enrollment ${enrollmentId} removed successfully` };
  }
}
