import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Answer } from '../../answer/entities/answer.entity';
import { Question } from '../../question/entities/question.entity';
import { QuizAttempt } from './quiz-attempt.entity';

@Entity('user_question_responses')
export class UserQuestionResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quiz_attempt_id: string;

  @Column({ type: 'uuid' })
  question_id: string;

  @Column({ type: 'uuid', nullable: true })
  selected_answer_id: string;

  @Column({ type: 'text', nullable: true })
  text_response: string;

  @Column({ type: 'boolean', default: false })
  is_correct: boolean;

  @Column({ type: 'int', default: 0 })
  points_earned: number;

  @ManyToOne(() => QuizAttempt, (attempt) => attempt.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_attempt_id' })
  quiz_attempt: QuizAttempt;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => Answer, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'selected_answer_id' })
  selected_answer: Answer;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
