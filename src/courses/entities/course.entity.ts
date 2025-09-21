import { Module } from 'src/entities/module.entity';
import { Review } from 'src/reviews/entities/reviews.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Category } from '../../entities/category.entity';
import { Objective } from '../../objectives/entities/objective.entity';
import { User } from '../../users/entities/user.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid' })
  professorId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'professorId' })
  professor: User;

  @OneToMany(() => Module, (module) => module.course)
  modules: Module[];

  @OneToMany(() => Review, (review) => review.course)
  reviews: Review[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Objective, (objective) => objective.course, {
    cascade: true,
    eager: false,
  })
  objectives: Objective[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  acquireReviewAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) {
      return 0;
    }

    const sum = this.reviews.reduce((acc, it) => acc + it.rating, 0);
    return sum / this.reviews.length;
  }
}
