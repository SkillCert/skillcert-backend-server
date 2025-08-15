import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Review } from './entities/reviews.entity';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(review: Review): Promise<Review> {
    return this.reviewRepository.create(review);
  }

  async findByCourseId(courseId: string): Promise<Review[]> {
    return this.reviewRepository.find({ where: { courseId } });
  }

  async findById(courseId: string, userId: string): Promise<Review | null> {
    return await this.reviewRepository.findOne({ where: { userId, courseId } });
  }

  async findByIdOrThrow(
    courseId: string,
    userId: string,
    onNotFound?: () => never,
  ): Promise<Review> {
    const review = await this.findById(courseId, userId);
    if (!review) {
      if (onNotFound!) {
        onNotFound();
      }

      throw new BadRequestException('cannot find review');
    }

    return review;
  }

  async update(
    courseId: string,
    userId: string,
    review: Review,
  ): Promise<boolean> {
    const result = await this.reviewRepository.update(
      { courseId, userId },
      { title: review.title, content: review.content, rating: review.rating },
    );

    return (result.affected ?? 0) > 0;
  }

  async delete(courseId: string, userId: string): Promise<boolean> {
    const result = await this.reviewRepository.delete({ courseId, userId });

    return (result.affected ?? 0) > 0;
  }
}
