  import { BadRequestException, Injectable } from '@nestjs/common';
  import { CreateQuestionDto } from '../../question/dto/create-question.dto';
  import { QuestionType } from '../../question/entities/question.entity';
  import { CreateQuizDto } from '../dto/create-quiz.dto';

  @Injectable()
  export class QuizValidationService {

     /*
      Brief description: Validates the structure and content of a quiz before creation.
      @param {CreateQuizDto} createQuizDto - The data transfer object containing quiz details and questions.
      @returns {void} Does not return a value. Throws exceptions if validation fails.
      @throws {BadRequestException} If the quiz has no questions or any question fails validation.
    */
    validateQuiz(createQuizDto: CreateQuizDto): void {
      if (!createQuizDto.questions || createQuizDto.questions.length === 0) {
        throw new BadRequestException('Quiz must have at least one question');
      }

      createQuizDto.questions.forEach((question, index) => {
        this.validateQuestion(question, index);
      });
    }

    /*
      Brief description: Validates an individual question based on its type and answers.
      @param {CreateQuestionDto} question - The question object to validate.
      @param {number} questionIndex - The index of the question within the quiz for error reference.
      @returns {void} Does not return a value. Throws exceptions if the question is invalid.
      @throws {BadRequestException} If the question type or structure is invalid.
    */
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

    /*
      Brief description: Validates that a unique choice question has exactly one correct answer.
      @param {CreateQuestionDto} question - The question object to validate.
      @param {string} questionPrefix - A prefix string used for clearer error messages.
      @returns {void} Does not return a value. Throws exceptions if validation fails.
      @throws {BadRequestException} If the question has fewer than two answers or more/less than one correct answer.
    */
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

    
   /*
      Brief description: Validates that a multiple choice question has at least one correct answer.
      @param {CreateQuestionDto} question - The question object to validate.
      @param {string} questionPrefix - A prefix string used for clearer error messages.
      @returns {void} Does not return a value. Throws exceptions if validation fails.
      @throws {BadRequestException} If the question has fewer than two answers or no correct answers.
    */
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

    /*
      Brief description: Validates that a text question has exactly one correct answer.
      @param {CreateQuestionDto} question - The question object to validate.
      @param {string} questionPrefix - A prefix string used for clearer error messages.
      @returns {void} Does not return a value. Throws exceptions if validation fails.
      @throws {BadRequestException} If the question has more or fewer than one answer, or the answer is not marked correct.
    */
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

    /*
      Brief description: Validates that a boolean question has two valid options (true/false or yes/no) and exactly one correct answer.
      @param {CreateQuestionDto} question - The question object to validate.
      @param {string} questionPrefix - A prefix string used for clearer error messages.
      @returns {void} Does not return a value. Throws exceptions if validation fails.
      @throws {BadRequestException} If the question does not have exactly two answers, valid options, or one correct answer.
    */
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
