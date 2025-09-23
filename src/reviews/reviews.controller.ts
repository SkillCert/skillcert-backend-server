import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/reviews.entity';
import { ReviewsService } from './reviews.service';

// TODO This field ne eds to be removed after the login integration process
const SAMPLE_USER_ID: string = 'DJKF392GKK';

@Controller('courses/:courseId/reviews')
@ApiTags('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review for a course' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: Review,
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
  create(
    @Param('courseId') courseId: string,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.createReview(
      SAMPLE_USER_ID,
      courseId,
      createReviewDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews for a course' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: [Review],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid course ID' },
        statusCode: { type: 'number', example: 400 },
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
  @HttpCode(HttpStatus.OK)
  findAll(
    @Param('courseId') courseId: string,
    @Query() filters: DateRangeFilterDto,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findCourseReviews(courseId, filters);
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('courseId') courseId: string): Promise<ReviewResponseDto> {
    return this.reviewsService.findCourseMyReview(SAMPLE_USER_ID, courseId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('courseId') courseId: string,
    @Body() updateDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.updateReview(
      SAMPLE_USER_ID,
      courseId,
      updateDto,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user review for a course' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Review not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('courseId') courseId: string): Promise<void> {
    return this.reviewsService.deleteReview(SAMPLE_USER_ID, courseId);
  }
}
