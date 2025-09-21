import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { QuizResultDto } from './dto/quiz-result.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizService } from './quiz.service';

@Controller('quizzes')
@ApiTags('quizzes')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({
    status: 201,
    description: 'Quiz created successfully',
    type: Quiz,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createQuizDto: CreateQuizDto): Promise<QuizResponseDto> {
    return this.quizService.create(createQuizDto);
  }

  @Get()
  findAll(): Promise<QuizResponseDto[]> {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<QuizResponseDto> {
    return this.quizService.findOne(id);
  }

  @Get('lesson/:lessonId')
  findByLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ): Promise<QuizResponseDto[]> {
    return this.quizService.findByLesson(lessonId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz by ID' })
  @ApiResponse({ status: 204, description: 'Quiz deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid quiz ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid quiz ID' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Quiz not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quiz not found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.quizService.remove(id);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted successfully',
    type: QuizResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid submission data',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid quiz submission' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  submitQuiz(@Body() submitQuizDto: SubmitQuizDto): Promise<QuizResultDto> {
    return this.quizService.submitQuiz(submitQuizDto);
  }

  @Get('attempt/:userId/:quizId')
  getUserQuizAttempt(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ): Promise<QuizAttempt | null> {
    return this.quizService.getUserQuizAttempt(userId, quizId);
  }

  @Get('passed/:userId/:quizId')
  hasUserPassedQuiz(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ): Promise<{ passed: boolean }> {
    return this.quizService
      .hasUserPassedQuiz(userId, quizId)
      .then((passed) => ({ passed }));
  }
}
