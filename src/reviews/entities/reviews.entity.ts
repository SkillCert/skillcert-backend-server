import { BadRequestException } from '@nestjs/common';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryColumn({ comment: 'user PK', type: 'varchar' })
  userId: string;

  @PrimaryColumn({ comment: 'course PK', type: 'varchar' })
  courseId: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'int' })
  rating: number;

  @ManyToOne(() => User, (user) => user.reviews, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.reviews, { eager: false })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static create(
    user: User,
    course: Course,
    rating: number,
    title?: string,
    content?: string,
  ): Review {
    Review.validateRating(rating);

    const review = new Review();

    review.user = user;
    review.userId = user.id;
    review.course = course;
    review.courseId = course.id;
    review.rating = rating;
    review.title = title;
    review.content = content;
    review.createdAt = new Date();
    review.updatedAt = new Date();

    return review;
  }

  update(rating: number, title?: string, content?: string) {
    this.rating = rating;
    this.title = title;
    this.content = content;
    this.updatedAt = new Date();
  }

  private static validateRating(rating: number) {
    if (![1, 2, 3, 4, 5].includes(rating)) {
      throw new BadRequestException(
        'The rating must be an integer between 1 and 5.',
      );
    }
  }
}
