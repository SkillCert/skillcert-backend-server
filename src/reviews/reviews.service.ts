import { Injectable, BadRequestException } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/reviews.entity';
import { CoursesRepository } from 'src/courses/courses.repository';
import { UsersRepository } from 'src/users/users.repository';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly userRepository: UsersRepository,
  ) {}

  async createReview(
    userId: string,
    courseId: string,
    createDto: CreateReviewDto,
  ): Promise<Review> {
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

    return this.reviewsRepository.create(newReview);
  }

  async findCourseReviews(courseId: string): Promise<Review[]> {
    return this.reviewsRepository.findByCourseId(courseId);
  }

  async findCourseMyReview(userId: string, courseId: string): Promise<Review> {
    return this.reviewsRepository.findByIdOrThrow(courseId, userId);
  }

  async updateReview(
    userId: string,
    courseId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
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

    return review;
  }

  async deleteReview(userId: string, courseId: string): Promise<void> {
    await this.reviewsRepository.delete(courseId, userId);
  }
}
