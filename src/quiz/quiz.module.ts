import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizValidationService } from './services/quiz-validation.service';
import { Quiz } from './entities/quiz.entity';
import { Question } from '../question/entities/question.entity';
import { Answer } from '../answer/entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])],
  controllers: [QuizController],
  providers: [QuizService, QuizValidationService],
  exports: [QuizService],
})
export class QuizModule {}
