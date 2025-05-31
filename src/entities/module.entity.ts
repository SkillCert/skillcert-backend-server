import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  course_id: string;

  @ManyToOne('Course')
  @JoinColumn({ name: 'course_id' })
  course: any;

  @OneToMany(() => Lesson, (lesson) => lesson.module)
  lessons: Lesson[];
}
