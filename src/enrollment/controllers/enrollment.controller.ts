import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DateRangeFilterDto, FilteredPaginationQueryDto } from '../../common';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { EnrollmentService } from '../providers/enrollment.service';

@Controller('enrollments')
@ApiTags('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all enrollments with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
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
  async findAll(@Query() query: FilteredPaginationQueryDto) {
    return this.enrollmentService.findAll(query.page, query.limit, query);
  }

  @Post()
  @ApiOperation({ summary: 'Enroll user in a course' })
  @ApiResponse({ status: 201, description: 'User enrolled successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Enrollment failed' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async enroll(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentService.enroll(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user enrollments' })
  @ApiParam({
    name: 'userId',
    required: true,
    type: 'string',
    example: 'user123',
    description: 'The unique identifier of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid userId format' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
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
  async getUserEnrollments(
    @Param('userId') userId: string,
    @Query() filters: DateRangeFilterDto,
  ) {
    return this.enrollmentService.getUserEnrollments(userId, filters);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment removed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Enrollment not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async remove(@Param('id') id: string) {
    return this.enrollmentService.removeEnrollment(id);
  }
}
