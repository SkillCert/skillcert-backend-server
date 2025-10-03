import { BadRequestException, Injectable } from '@nestjs/common';
import { CoursesRepository } from 'src/courses/courses.repository';
import { UsersRepository } from 'src/users/users.repository';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/reviews.entity';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly userRepository: UsersRepository,
  ) {}

  /*
   * Brief description: Transforms a Review entity into a ReviewResponseDto.
   * @param {Review} review - The review entity to transform.
   * @returns {ReviewResponseDto} The review response DTO containing review data.
   */
  private toResponseDto(review: Review): ReviewResponseDto {
    return {
      userId: review.userId,
      courseId: review.courseId,
      title: review.title,
      content: review.content,
      rating: review.rating,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  /*
   * Brief description: Creates a new review for a course by a user.
   * @param {string} userId - The ID of the user creating the review.
   * @param {string} courseId - The ID of the course being reviewed.
   * @param {CreateReviewDto} createDto - The data transfer object containing review details.
   * @returns {Promise<ReviewResponseDto>} A promise that resolves to the created review data.
   * @throws {BadRequestException} If a review already exists for this user and course.
   */
  async createReview(
    userId: string,
    courseId: string,
    createDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.findById(courseId, userId);
    if (review) {
      throw new BadRequestException('Review already exists');
    }

    const course = await this.courseRepository.findByIdOrThrow(courseId);
    const user = await this.userRepository.findByIdOrThrow(userId);

    const newReview = Review.create(
      user,
      course,
      createDto.rating,
      createDto.title,
      createDto.content,
    );

    const saved = await this.reviewsRepository.create(newReview);
    return this.toResponseDto(saved);
  }

  /*
   * Brief description: Retrieves all reviews for a specific course with optional date range filtering.
   * @param {string} courseId - The ID of the course to find reviews for.
   * @param {DateRangeFilterDto} filters - Optional date range filters to apply to the search.
   * @returns {Promise<ReviewResponseDto[]>} A promise that resolves to an array of review response DTOs.
   */
  async findCourseReviews(
    courseId: string,
    filters?: DateRangeFilterDto,
  ): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewsRepository.findByCourseId(
      courseId,
      filters,
    );
    return reviews.map((r) => this.toResponseDto(r));
  }

  /*
   * Brief description: Retrieves a specific user's review for a course.
   * @param {string} userId - The ID of the user who wrote the review.
   * @param {string} courseId - The ID of the course being reviewed.
   * @returns {Promise<ReviewResponseDto>} A promise that resolves to the user's review data.
   * @throws {Error} If the review is not found.
   */
  async findCourseMyReview(
    userId: string,
    courseId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.findByIdOrThrow(
      courseId,
      userId,
    );
    return this.toResponseDto(review);
  }

  /*
   * Brief description: Updates an existing review for a course.
   * @param {string} userId - The ID of the user who owns the review.
   * @param {string} courseId - The ID of the course being reviewed.
   * @param {UpdateReviewDto} updateReviewDto - The data transfer object containing updated review details.
   * @returns {Promise<ReviewResponseDto>} A promise that resolves to the updated review data.
   * @throws {Error} If the review is not found.
   */
  async updateReview(
    userId: string,
    courseId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.findByIdOrThrow(
      courseId,
      userId,
    );

    review.update(
      updateReviewDto.rating,
      updateReviewDto.title,
      updateReviewDto.content,
    );

    await this.reviewsRepository.update(courseId, userId, review);
    return this.toResponseDto(review);
  }

  /*
   * Brief description: Deletes a user's review for a specific course.
   * @param {string} userId - The ID of the user who owns the review.
   * @param {string} courseId - The ID of the course being reviewed.
   * @returns {Promise<void>} A promise that resolves when the review is successfully deleted.
   */
  async deleteReview(userId: string, courseId: string): Promise<void> {
    await this.reviewsRepository.delete(courseId, userId);
  }
}
