import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { QuizAttempt } from '../quiz/entities/quiz-attempt.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { CourseProgressController } from './controllers/course-progress.controller';
import { CourseProgress } from './entities/course-progress.entity';
import { CourseProgressService } from './providers/course-progress.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseProgress,
      Enrollment,
      Lesson,
      Quiz,
      QuizAttempt,
    ]),
  ],
  controllers: [CourseProgressController],
  providers: [CourseProgressService],
  exports: [CourseProgressService],
})
export class CourseProgressModule {}
