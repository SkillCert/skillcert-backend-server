import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CourseProgress } from '../../course-progress/entities/course-progress.entity';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';

@Entity('enrollments')
@Unique(['user', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @OneToMany(() => CourseProgress, (progress) => progress.enrollment)
  progress: CourseProgress[];

  @CreateDateColumn()
  enrolledAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 64, unique: true, nullable: true })
  certificateTxHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  issuedAt: Date | null;
}
