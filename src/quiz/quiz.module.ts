import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../answer/entities/answer.entity';
import { Question } from '../question/entities/question.entity';
import { User } from '../users/entities/user.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { Quiz } from './entities/quiz.entity';
import { UserQuestionResponse } from './entities/user-question-response.entity';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizValidationService } from './services/quiz-validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      QuizAttempt,
      UserQuestionResponse,
      Question,
      Answer,
      User,
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService, QuizValidationService],
  exports: [QuizService],
})
export class QuizModule {}
