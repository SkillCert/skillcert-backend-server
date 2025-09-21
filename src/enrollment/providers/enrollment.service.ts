import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ): Promise<UserEnrollmentsResponseDto> {
    const enrollments = await this.enrollmentRepo.find({
      where: { user: { id: userId } },
      relations: ['course', 'user'],
    });

    return {
      userId,
      enrollments: enrollments.map(this.toResponseDto),
    };
  }

  async removeEnrollment(enrollmentId: string): Promise<{ message: string }> {
    await this.enrollmentRepo.delete(enrollmentId);
    return { message: `Enrollment ${enrollmentId} removed successfully` };
  }
}
