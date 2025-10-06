import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERCENTAGE_MULTIPLIER } from '../../common/constants';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { QuizAttempt } from '../../quiz/entities/quiz-attempt.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';
import {
  AnalyticsResponseDto,
  CompletionRateResponseDto,
  CourseProgressResponseDto,
} from '../dto/course-progress.dto';
import { UpdateProgressDto } from '../dto/update-course-progress.dto';
import {
  CourseProgress,
  ProgressStatus,
} from '../entities/course-progress.entity';

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private progressRepo: Repository<CourseProgress>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepo: Repository<QuizAttempt>,
  ) { }

  /**
   * Converts a CourseProgress entity to a CourseProgressResponseDto.
   * @param {CourseProgress} progress - The CourseProgress entity to convert.
   * @returns {CourseProgressResponseDto} The resulting DTO object.
   */
  private responseToDto(progress: CourseProgress): CourseProgressResponseDto {
    return {
      enrollmentId: progress.enrollment.id,
      lessonId: progress.lesson.id,
      status: progress.status,
      lessonTitle: progress.lesson?.title,
    };
  }

  /**
   * Creates or updates the progress status for a lesson within an enrollment.
   * It verifies quiz requirements before marking a lesson as 'completed'.
   * @param {UpdateProgressDto} dto - DTO containing enrollmentId, lessonId, and new status.
   * @returns {Promise<CourseProgressResponseDto>} A promise that resolves to the DTO of the updated/created progress record.
   * @throws {NotFoundException} If the specified enrollment or lesson does not exist.
   * @throws {BadRequestException} If trying to complete a lesson without passing its required quizzes.
   */
  async updateProgress(
    dto: UpdateProgressDto,
  ): Promise<CourseProgressResponseDto> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: dto.enrollmentId },
      relations: ['user'],
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const lesson = await this.lessonRepo.findOne({
      where: { id: dto.lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // If trying to mark lesson as completed, check if quiz requirements are met
    if (dto.status === ProgressStatus.COMPLETED) {
      await this.checkQuizRequirements(enrollment.user.id, dto.lessonId);
    }

    let progress = await this.progressRepo.findOne({
      where: {
        enrollment: { id: dto.enrollmentId },
        lesson: { id: dto.lessonId },
      },
      relations: ['enrollment', 'lesson'],
    });

    if (!progress) {
      progress = this.progressRepo.create({
        enrollment,
        lesson,
        status: dto.status,
      });
    } else {
      progress.status = dto.status;
    }
    const saved = await this.progressRepo.save(progress);
    return this.responseToDto(saved);
  }

  /**
   * A private helper to verify that a user has passed all quizzes for a specific lesson.
   * @param {string} userId - The ID of the user whose quiz attempts are being checked.
   * @param {string} lessonId - The ID of the lesson to check for quiz requirements.
   * @returns {Promise<void>} A promise that resolves if all quiz requirements are met.
   * @throws {BadRequestException} If any quiz associated with the lesson has not been passed by the user.
   */
  private async checkQuizRequirements(userId: string, lessonId: string): Promise<void> {
    const quizzes = await this.quizRepo.find({
      where: { lesson_id: lessonId },
    });

    if (quizzes.length === 0) {
      return;
    }
    for (const quiz of quizzes) {
      const attempt = await this.quizAttemptRepo.findOne({
        where: {
          user_id: userId,
          quiz_id: quiz.id,
        },
      });

      if (!attempt || !attempt.passed) {
        throw new BadRequestException(
          `Cannot complete lesson. You must pass the quiz "${quiz.title}" first.`,
        );
      }
    }
  }

  /**
   * Retrieves all progress records for a given course enrollment.
   * @param {string} enrollmentId - The ID of the enrollment to retrieve progress for.
   * @returns {Promise<CourseProgressResponseDto[]>} A promise that resolves to an array of DTOs representing the lesson progress for the enrollment.
   */
  async getCourseProgress(enrollmentId: string):Promise<CourseProgressResponseDto[]> {
    const progress = await this.progressRepo.find({
      where: { enrollment: { id: enrollmentId } },
      relations: ['lesson', 'enrollment'],
    });
    return progress.map(this.responseToDto);
  }

  /**
   * Calculates the completion rate for a specific course enrollment.
   * @param {string} enrollmentId - The ID of the enrollment for which to calculate the completion rate.
   * @returns {Promise<CompletionRateResponseDto>} A promise that resolves to an object with the total, completed, and completion rate percentage.
   */
  async getCompletionRate(
    enrollmentId: string,
  ): Promise<CompletionRateResponseDto> {
    const total = await this.progressRepo.count({
      where: { enrollment: { id: enrollmentId } },
    });

    if (total === 0) {
      return { enrollmentId, completed: 0, total: 0, completionRate: 0 };
    }

    const completed = await this.progressRepo.count({
      where: {
        enrollment: { id: enrollmentId },
        status: ProgressStatus.COMPLETED,
      },
    });
    

    return {
      enrollmentId,
      completed,
      total,
      completionRate: Math.round((completed / total) * 100),
    };
  }

  /**
   * Provides overall analytics for course progress across all enrollments and users.
   * @returns {Promise<AnalyticsResponseDto>} A promise that resolves to an object containing total progress records, completed records, and the overall completion rate.
   */
  async getAnalytics(): Promise<AnalyticsResponseDto> {
    const totalProgress = await this.progressRepo.count();
    const completed = await this.progressRepo.count({
      where: { status: ProgressStatus.COMPLETED },
    });

    return {
      totalProgress,
      completed,
      overallCompletionRate:
        totalProgress > 0
          ? (completed / totalProgress) * PERCENTAGE_MULTIPLIER
          : 0,
    };
  }
}
