import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { COLUMN_LENGTHS } from '../common/constants';
import { Lesson } from './lesson.entity';

export enum ResourceType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

@Entity('lesson_resources')
export class LessonResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: COLUMN_LENGTHS.FILENAME })
  filename: string;

  @Column({ type: 'varchar', length: COLUMN_LENGTHS.ORIGINAL_NAME })
  original_name: string;

  @Column({ type: 'varchar', length: COLUMN_LENGTHS.MIMETYPE })
  mimetype: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'text' })
  file_path: string;

  @Column({ type: 'text' })
  file_url: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  resource_type: ResourceType;

  @Column({ type: 'uuid' })
  lesson_id: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.resources, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  download_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
