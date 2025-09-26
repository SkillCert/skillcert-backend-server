import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../answer/entities/answers.entity';
import { CentralizedLoggerService } from '../common/logger/services/centralized-logger.service';
import { Question, QuestionType } from '../question/entities/question.entity';
import { User } from '../users/entities/user.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuestionResultDto, QuizResultDto } from './dto/quiz-result.dto';
import { QuestionResponseDto, SubmitQuizDto } from './dto/submit-quiz.dto';
import { PERCENTAGE_MULTIPLIER, QUIZ_PASSING_THRESHOLD } from '../common/constants';
import { AttemptStatus, QuizAttempt } from './entities/quiz-attempt.entity';
import { Quiz } from './entities/quiz.entity';
import { UserQuestionResponse } from './entities/user-question-response.entity';
import { QuizValidationService } from './services/quiz-validation.service';
import { QuizResponseDto } from './dto/quiz-response.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(UserQuestionResponse)
    private userQuestionResponseRepository: Repository<UserQuestionResponse>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private quizValidationService: QuizValidationService,
    @Inject(CentralizedLoggerService)
    private readonly logger: CentralizedLoggerService,
  ) {
    this.logger.setContext(QuizService.name);
  }

  private toResponseDto(quiz: Quiz): QuizResponseDto {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      lesson_id: quiz.lesson_id,
      questions: quiz.questions?.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        answers: q.answers?.map((a) => ({
          id: a.id,
          text: a.text,
          correct: a.correct,
          created_at: a.created_at,
          updated_at: a.updated_at,
        })) || [],
        created_at: q.created_at,
        updated_at: q.updated_at,
      })) || [],
      created_at: quiz.created_at,
      updated_at: quiz.updated_at,
    };
  }

  async create(createQuizDto: CreateQuizDto): Promise<QuizResponseDto> {
    // Validate the quiz structure
    this.quizValidationService.validateQuiz(createQuizDto);

    // Create quiz
    const quiz = this.quizRepository.create({
      title: createQuizDto.title,
      description: createQuizDto.description,
      lesson_id: createQuizDto.lesson_id,
    });

    const savedQuiz = await this.quizRepository.save(quiz);

    // Create questions and answers
    for (const questionDto of createQuizDto.questions) {
      const question = this.questionRepository.create({
        quiz_id: savedQuiz.id,
        text: questionDto.text,
        type: questionDto.type,
      });

      const savedQuestion = await this.questionRepository.save(question);

      // Create answers for this question
      for (const answerDto of questionDto.answers) {
        const answer = this.answerRepository.create({
          question_id: savedQuestion.id,
          text: answerDto.text,
          correct: answerDto.correct,
        });

        await this.answerRepository.save(answer);
      }
    }

    // Return the complete quiz with relations
    return this.findOne(savedQuiz.id);
  }

  async findAll(): Promise<QuizResponseDto[]> {
    return await this.quizRepository.find({
      relations: ['lesson', 'questions', 'questions.answers'],
      order: {
        created_at: 'DESC',
        questions: {
          created_at: 'DESC',
        },
      },
    });
  }

  async findOne(id: string): Promise<QuizResponseDto> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['lesson', 'questions', 'questions.answers'],
      order: {
        questions: {
          created_at: 'DESC',
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async findByLesson(lessonId: string): Promise<QuizResponseDto[]> {
    return await this.quizRepository.find({
      where: { lesson_id: lessonId },
      relations: ['questions', 'questions.answers'],
      order: {
        created_at: 'DESC',
        questions: {
          created_at: 'DESC',
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const quiz = await this.findOne(id);

    // Delete answers first
    for (const question of quiz.questions) {
      await this.answerRepository.delete({ question_id: question.id });
    }

    // Delete questions
    await this.questionRepository.delete({ quiz_id: id });

    // Delete quiz
    await this.quizRepository.delete(id);
  }

  async submitQuiz(submitQuizDto: SubmitQuizDto): Promise<QuizResultDto> {
    this.logger.info('Quiz submission started', {
      userId: submitQuizDto.user_id,
      quizId: submitQuizDto.quiz_id,
      responseCount: submitQuizDto.responses?.length || 0,
    });

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: submitQuizDto.user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get quiz with questions and answers
    const quiz = await this.findOne(submitQuizDto.quiz_id);

    // Check if user already has an attempt (since we only allow one attempt per user per quiz)
    const existingAttempt = await this.quizAttemptRepository.findOne({
      where: {
        user_id: submitQuizDto.user_id,
        quiz_id: submitQuizDto.quiz_id,
      },
    });

    let quizAttempt: QuizAttempt;

    if (existingAttempt) {
      // Update existing attempt
      quizAttempt = existingAttempt;
      // Clear previous responses
      await this.userQuestionResponseRepository.delete({
        quiz_attempt_id: quizAttempt.id,
      });
    } else {
      // Create new attempt
      quizAttempt = this.quizAttemptRepository.create({
        user_id: submitQuizDto.user_id,
        quiz_id: submitQuizDto.quiz_id,
        started_at: new Date(),
        total_questions: quiz.questions.length,
      });
      quizAttempt = await this.quizAttemptRepository.save(quizAttempt);
    }

    const questionResults: QuestionResultDto[] = [];
    let totalScore = 0;

    // Process each response
    for (const responseDto of submitQuizDto.responses) {
      const question = quiz.questions.find(
        (q) => q.id === responseDto.question_id,
      );
      if (!question) {
        throw new BadRequestException(
          `Question ${responseDto.question_id} not found in quiz`,
        );
      }

      const scoreResult = this.scoreQuestion(question, responseDto);

      // Save user response
      const userResponse = this.userQuestionResponseRepository.create({
        quiz_attempt_id: quizAttempt.id,
        question_id: responseDto.question_id,
        selected_answer_id: responseDto.selected_answer_id,
        text_response: responseDto.text_response,
        is_correct: scoreResult.isCorrect,
        points_earned: scoreResult.pointsEarned,
      });

      await this.userQuestionResponseRepository.save(userResponse);

      totalScore += scoreResult.pointsEarned;

      questionResults.push({
        question_id: question.id,
        question_text: question.text,
        user_answer: scoreResult.userAnswer,
        correct_answer: scoreResult.correctAnswer,
        is_correct: scoreResult.isCorrect,
        points_earned: scoreResult.pointsEarned,
      });
    }

    // Calculate final score and percentage
    const percentage =
      quiz.questions.length > 0
        ? (totalScore / quiz.questions.length) * PERCENTAGE_MULTIPLIER
        : 0;
    const passed = percentage >= QUIZ_PASSING_THRESHOLD; // 70% passing threshold

    // Update quiz attempt
    quizAttempt.score = totalScore;
    quizAttempt.percentage = percentage;
    quizAttempt.passed = passed;
    quizAttempt.status = AttemptStatus.COMPLETED;
    quizAttempt.completed_at = new Date();

    await this.quizAttemptRepository.save(quizAttempt);

    return {
      attempt_id: quizAttempt.id,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      score: totalScore,
      total_questions: quiz.questions.length,
      percentage: Number(percentage.toFixed(2)),
      passed,
      completed_at: quizAttempt.completed_at,
      question_results: questionResults,
    };
  }

  private scoreQuestion(
    question: Question,
    responseDto: QuestionResponseDto,
  ): {
    isCorrect: boolean;
    pointsEarned: number;
    userAnswer: string;
    correctAnswer: string;
  } {
    const correctAnswers = question.answers.filter((answer) => answer.correct);

    switch (question.type) {
      case QuestionType.UNIQUE:
      case QuestionType.BOOL:
        return this.scoreUniqueQuestion(question, responseDto, correctAnswers);

      case QuestionType.MULTIPLE:
        return this.scoreMultipleChoiceQuestion(
          question,
          responseDto,
          correctAnswers,
        );

      case QuestionType.TEXT:
        return this.scoreTextQuestion(question, responseDto, correctAnswers);

      default:
        throw new BadRequestException(
          `Unsupported question type: ${question.type as string}`,
        );
    }
  }

  private scoreUniqueQuestion(
    question: Question,
    responseDto: QuestionResponseDto,
    correctAnswers: Answer[],
  ) {
    if (!responseDto.selected_answer_id) {
      return {
        isCorrect: false,
        pointsEarned: 0,
        userAnswer: 'No answer selected',
        correctAnswer: correctAnswers[0]?.text || 'Unknown',
      };
    }

    const selectedAnswer = question.answers.find(
      (answer) => answer.id === responseDto.selected_answer_id,
    );

    const isCorrect = selectedAnswer?.correct || false;

    return {
      isCorrect,
      pointsEarned: isCorrect ? 1 : 0,
      userAnswer: selectedAnswer?.text || 'Unknown',
      correctAnswer: correctAnswers[0]?.text || 'Unknown',
    };
  }

  private scoreMultipleChoiceQuestion(
    question: Question,
    responseDto: QuestionResponseDto,
    correctAnswers: Answer[],
  ) {
    if (!responseDto.selected_answer_id) {
      return {
        isCorrect: false,
        pointsEarned: 0,
        userAnswer: 'No answer selected',
        correctAnswer: correctAnswers.map((a) => a.text).join(', '),
      };
    }

    const selectedAnswer = question.answers.find(
      (answer) => answer.id === responseDto.selected_answer_id,
    );

    const isCorrect = selectedAnswer?.correct || false;

    return {
      isCorrect,
      pointsEarned: isCorrect ? 1 : 0,
      userAnswer: selectedAnswer?.text || 'Unknown',
      correctAnswer: correctAnswers.map((a) => a.text).join(', '),
    };
  }

  private scoreTextQuestion(
    _question: Question,
    responseDto: QuestionResponseDto,
    correctAnswers: Answer[],
  ) {
    if (!responseDto.text_response) {
      return {
        isCorrect: false,
        pointsEarned: 0,
        userAnswer: 'No answer provided',
        correctAnswer: correctAnswers[0]?.text || 'Unknown',
      };
    }

    const correctAnswer = correctAnswers[0]?.text || '';
    const userAnswer = responseDto.text_response?.trim() || '';

    // Case-insensitive comparison
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    return {
      isCorrect,
      pointsEarned: isCorrect ? 1 : 0,
      userAnswer,
      correctAnswer,
    };
  }

  async getUserQuizAttempt(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt | null> {
    return await this.quizAttemptRepository.findOne({
      where: {
        user_id: userId,
        quiz_id: quizId,
      },
      relations: [
        'quiz',
        'responses',
        'responses.question',
        'responses.selected_answer',
      ],
    });
  }

  async hasUserPassedQuiz(userId: string, quizId: string): Promise<boolean> {
    const attempt = await this.getUserQuizAttempt(userId, quizId);
    return attempt?.passed || false;
  }
}
