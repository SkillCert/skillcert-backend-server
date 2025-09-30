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

  async deleteReview(userId: string, courseId: string): Promise<void> {
    await this.reviewsRepository.delete(courseId, userId);
  }
}
