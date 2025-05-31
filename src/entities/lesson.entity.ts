import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reference } from './reference.entity';
import { Module } from './module.entity';

export enum LessonType {
  TEXT = 'text',
  VIDEO = 'video',
  QUIZ = 'quiz',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.TEXT,
  })
  type: LessonType;

  @Column({ nullable: true })
  module_id: string;

  @ManyToOne(() => Module, (module) => module.lessons)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @OneToMany(() => Reference, (reference) => reference.lesson)
  references: Reference[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
