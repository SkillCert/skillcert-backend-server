import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Lesson } from '../entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@ApiTags('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({
    status: 201,
    description: 'Lesson created successfully',
    type: Lesson,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Validation failed' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<{ message: string; data: LessonResponseDto }> {
    const lesson = await this.lessonsService.create(createLessonDto);
    return { message: 'Lesson created successfully', data: lesson };
  }

  @Get()
  async findAll(): Promise<{ message: string; data: LessonResponseDto[] }> {
    const lessons = await this.lessonsService.findAll();
    return { message: 'Lessons fetched successfully', data: lessons };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string; data: LessonResponseDto }> {
    const lesson = await this.lessonsService.findOne(id);
    return { message: 'Lesson fetched successfully', data: lesson };
  }

  @Get('module/:moduleId')
  async findByModuleId(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
  ): Promise<{ message: string; data: LessonResponseDto[] }> {
    const lessons = await this.lessonsService.findByModuleId(moduleId);
    return { message: 'Lessons by module fetched successfully', data: lessons };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lesson by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated successfully',
    type: Lesson,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lesson not found or validation failed',
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<{ message: string; data: LessonResponseDto }> {
    const lesson = await this.lessonsService.update(id, updateLessonDto);
    return { message: 'Lesson updated successfully', data: lesson };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson by ID' })
  @ApiResponse({ status: 204, description: 'Lesson deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Lesson not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.lessonsService.remove(id);
  }
}
