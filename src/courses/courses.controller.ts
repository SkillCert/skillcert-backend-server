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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilteredPaginationQueryDto } from '../common';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CoursesService } from './courses.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { Course } from './entities/course.entity';

@Controller('courses')
@ApiTags('courses')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        title: { type: 'string', example: 'Introduction to Programming' },
        description: {
          type: 'string',
          example: 'Learn the basics of programming',
        },
        createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
      },
    },
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
  create(
    @Body() createCourseDto: { title: string; description?: string },
  ): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          title: { type: 'string', example: 'Introduction to Programming' },
          description: {
            type: 'string',
            example: 'Learn the basics of programming',
          },
          createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request parameters' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination. Defaults to 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page. Defaults to 20, max 100.',
    example: 10,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    example: '2023-12-31T23:59:59.999Z',
  })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: FilteredPaginationQueryDto,
  ): Promise<{ courses: CourseResponseDto[]; total: number }> {
    return this.coursesService.findAll(query.page, query.limit, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        title: { type: 'string', example: 'Introduction to Programming' },
        description: {
          type: 'string',
          example: 'Learn the basics of programming',
        },
        createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid course ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Course not found' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        title: { type: 'string', example: 'Advanced Programming' },
        description: {
          type: 'string',
          example: 'Learn advanced programming concepts',
        },
        createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', example: '2023-01-02T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or course ID',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Course not found or validation failed',
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: { title?: string; description?: string },
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 204,
    description: 'Course deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid course ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Course not found' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
