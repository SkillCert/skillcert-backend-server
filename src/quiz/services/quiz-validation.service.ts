import { Injectable, BadRequestException } from '@nestjs/common';
import { QuestionType } from '../../question/entities/question.entity';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { CreateQuestionDto } from '../../question/dto/create-question.dto';

@Injectable()
export class QuizValidationService {
  validateQuiz(createQuizDto: CreateQuizDto): void {
    if (!createQuizDto.questions || createQuizDto.questions.length === 0) {
      throw new BadRequestException('Quiz must have at least one question');
    }

    createQuizDto.questions.forEach((question, index) => {
      this.validateQuestion(question, index);
    });
  }

  private validateQuestion(
    question: CreateQuestionDto,
    questionIndex: number,
  ): void {
    const questionPrefix = `Question ${questionIndex + 1}`;

    if (!question.answers || question.answers.length === 0) {
      throw new BadRequestException(
        `${questionPrefix}: Must have at least one answer`,
      );
    }


    switch (question.type) {
      case QuestionType.UNIQUE:
        this.validateUniqueQuestion(question, questionPrefix);
        break;
      case QuestionType.MULTIPLE:
        this.validateMultipleQuestion(question, questionPrefix);
        break;
      case QuestionType.TEXT:
        this.validateTextQuestion(question, questionPrefix);
        break;
      case QuestionType.BOOL:
        this.validateBoolQuestion(question, questionPrefix);
        break;
      default:
        throw new BadRequestException(
          `${questionPrefix}: Invalid question type`,
        );
    }
  }

  private validateUniqueQuestion(
    question: CreateQuestionDto,
    questionPrefix: string,
  ): void {
    if (question.answers.length < 2) {
      throw new BadRequestException(
        `${questionPrefix}: Unique choice questions must have at least 2 answers`,
      );
    }

    const correctAnswers = question.answers.filter((answer) => answer.correct);
    if (correctAnswers.length !== 1) {
      throw new BadRequestException(
        `${questionPrefix}: Unique choice questions must have exactly one correct answer`,
      );
    }
  }

  private validateMultipleQuestion(
    question: CreateQuestionDto,
    questionPrefix: string,
  ): void {
    if (question.answers.length < 2) {
      throw new BadRequestException(
        `${questionPrefix}: Multiple choice questions must have at least 2 answers`,
      );
    }

    const correctAnswers = question.answers.filter((answer) => answer.correct);
    if (correctAnswers.length === 0) {
      throw new BadRequestException(
        `${questionPrefix}: Multiple choice questions must have at least one correct answer`,
      );
    }
  }

  private validateTextQuestion(
    question: CreateQuestionDto,
    questionPrefix: string,
  ): void {
    if (question.answers.length !== 1) {
      throw new BadRequestException(
        `${questionPrefix}: Text questions must have exactly one answer`,
      );
    }

    if (!question.answers[0].correct) {
      throw new BadRequestException(
        `${questionPrefix}: Text question answer must be marked as correct`,
      );
    }
  }

  private validateBoolQuestion(
    question: CreateQuestionDto,
    questionPrefix: string,
  ): void {
    if (question.answers.length !== 2) {
      throw new BadRequestException(
        `${questionPrefix}: Boolean questions must have exactly 2 answers (true/false)`,
      );
    }

    const correctAnswers = question.answers.filter((answer) => answer.correct);
    if (correctAnswers.length !== 1) {
      throw new BadRequestException(
        `${questionPrefix}: Boolean questions must have exactly one correct answer`,
      );
    }

    // Check if answers represent true/false options
    const answerTexts = question.answers.map((a) => a.text.toLowerCase());
    const hasValidBoolOptions =
      (answerTexts.includes('true') && answerTexts.includes('false')) ||
      (answerTexts.includes('yes') && answerTexts.includes('no'));

    if (!hasValidBoolOptions) {
      throw new BadRequestException(
        `${questionPrefix}: Boolean questions should have true/false or yes/no answers`,
      );
    }
  }
}
