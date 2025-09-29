import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';
import { QuizAttempt } from '../../quiz/entities/quiz-attempt.entity';
import { UpdateProgressDto } from '../dto/update-course-progress.dto';
import { CourseProgressResponseDto, CompletionRateResponseDto, AnalyticsResponseDto } from '../dto/course-progress.dto';
import {
  CourseProgress,
  ProgressStatus,
} from '../entities/course-progress.entity';
import { PERCENTAGE_MULTIPLIER } from '../../common/constants';

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
  
  private responseToDto(progress: CourseProgress): CourseProgressResponseDto {
    return {
      enrollmentId: progress.enrollment.id,
      lessonId: progress.lesson.id,
      status: progress.status,
      lessonTitle: progress.lesson?.title,
    };
  }


  async updateProgress(dto: UpdateProgressDto):Promise<CourseProgressResponseDto> {
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
          `Cannot complete lesson. You must pass the quiz "${quiz.title}" first.`
        );
      }
    }
  }

  async getCourseProgress(enrollmentId: string):Promise<CourseProgressResponseDto[]> {
    const progress = await this.progressRepo.find({
      where: { enrollment: { id: enrollmentId } },
      relations: ['lesson', 'enrollment'],
    });
    return progress.map(this.responseToDto);
  }

  async getCompletionRate(enrollmentId: string): Promise<CompletionRateResponseDto> {
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

  async getAnalytics(): Promise<AnalyticsResponseDto> {
    const totalProgress = await this.progressRepo.count();
    const completed = await this.progressRepo.count({ where: { status: ProgressStatus.COMPLETED } });


    return {
      totalProgress,
      completed,
      overallCompletionRate:
        totalProgress > 0 ? (completed / totalProgress) * PERCENTAGE_MULTIPLIER : 0,
    };
  }
}
