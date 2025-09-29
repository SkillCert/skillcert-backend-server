import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answers } from './entities/answers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answers])],
  exports: [TypeOrmModule],
})
export class AnswersModule {}
