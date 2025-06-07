import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReferencesModule } from './references/references.module';
import { Reference } from './entities/reference.entity';
import { Module as CourseModule } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';
import { Course } from './entities/course.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizModule } from './quiz/quiz.module';
import { CoursesModule } from './courses/courses.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'skillcert',
      entities: [Reference, CourseModule, Lesson, Course, User],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ReferencesModule,
    UsersModule,
    CoursesModule,
    ModulesModule,
    LessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
