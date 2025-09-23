import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';
import { Review } from './entities/reviews.entity';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  private applyDateFilters(
    queryBuilder: SelectQueryBuilder<Review>,
    filters: DateRangeFilterDto,
  ): SelectQueryBuilder<Review> {
    if (filters.startDate) {
      queryBuilder.andWhere('review.createdAt >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('review.createdAt <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    return queryBuilder;
  }

  async create(review: Review): Promise<Review> {
    return this.reviewRepository.create(review);
  }

  async findByCourseId(
    courseId: string,
    filters?: DateRangeFilterDto,
  ): Promise<Review[]> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .where('review.courseId = :courseId', { courseId })
      .orderBy('review.createdAt', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    return queryBuilder.getMany();
  }

  async findAll(
    page?: number,
    limit?: number,
    filters?: DateRangeFilterDto,
  ): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.course', 'course')
      .orderBy('review.createdAt', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [reviews, total] = await queryBuilder.getManyAndCount();
    return { reviews, total };
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
