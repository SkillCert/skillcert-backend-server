import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateProgressDto } from '../dto/update-course-progress.dto';
import { CourseProgressService } from '../providers/course-progress.service';

@Controller('course-progress')
@ApiTags('course-progress')
export class CourseProgressController {
  constructor(private readonly progressService: CourseProgressService) {}

  @Post('update-course-progress')
  @ApiOperation({ summary: 'Update course progress' })
  @ApiResponse({ status: 201, description: 'Progress updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid progress data' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async update(@Body() dto: UpdateProgressDto) {
    return this.progressService.updateProgress(dto);
  }

  @Get(':enrollmentId')
  @ApiOperation({ summary: 'get course progress by enrollment ID' })
  @ApiResponse({ status: 200, description: 'Progress get successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Enrollment on course not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async getProgress(@Param('enrollmentId') enrollmentId: string) {
    return this.progressService.getProgress(enrollmentId);
  }

  @Get(':enrollmentId/completion-rate')
  @ApiOperation({ summary: 'Get completion rate for enrollment' })
  @ApiResponse({
    status: 200,
    description: 'Completion rate retrieved successfully',
  })
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
  async getCompletionRate(@Param('enrollmentId') enrollmentId: string) {
    return this.progressService.getCompletionRate(enrollmentId);
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get course progress analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async getAnalytics() {
    return this.progressService.getAnalytics();
  }
}
