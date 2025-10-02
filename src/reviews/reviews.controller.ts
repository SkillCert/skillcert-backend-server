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

  /**
   * Brief description: Creates a new review for a specific course.
   * @param {string} courseId - The ID of the course to create the review for.
   * @param {CreateReviewDto} createReviewDto - The data transfer object containing review details.
   * @returns {Promise<ReviewResponseDto>} A promise that resolves to the created review response.
   */
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

  /**
   * Brief description: Retrieves all reviews for a specific course, optionally filtered by date range.
   * @param {string} courseId - The ID of the course to retrieve reviews for.
   * @param {DateRangeFilterDto} filters - The date range filters for the reviews.
   * @returns {Promise<ReviewResponseDto[]>} A promise that resolves to an array of review responses.
   */
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

  /**
   * Brief description: Retrieves the current user's review for a specific course.
   * @param {string} courseId - The ID of the course to retrieve the review for.
   * @returns {Promise<ReviewResponseDto>} A promise that resolves to the user's review response.
   */
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('courseId') courseId: string): Promise<ReviewResponseDto> {
    return this.reviewsService.findCourseMyReview(SAMPLE_USER_ID, courseId);
  }

  /**
   * Brief description: Updates an existing review for a specific course.
   * @param {string} courseId - The ID of the course the review belongs to.
   * @param {UpdateReviewDto} updateDto - The data transfer object containing updated review details.
   * @returns {Promise<ReviewResponseDto>} A promise that resolves to the updated review response.
   */
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

  /**
   * Brief description: Deletes the current user's review for a specific course.
   * @param {string} courseId - The ID of the course to delete the review from.
   * @returns {Promise<void>} A promise that resolves when the review is deleted.
   */
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
