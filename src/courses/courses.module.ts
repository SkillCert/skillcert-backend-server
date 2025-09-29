/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { CoursesController } from './controllers/courses.controller';
import { CoursesRepository } from './courses.repository';
import { Course } from './entities/course.entity';
import { CoursesService } from './providers/courses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    UsersModule, // Import to use UsersService for validation
    CategoriesModule, // Import to use CategoriesService for validation
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository],
  exports: [CoursesService, CoursesRepository],
})
export class CoursesModule {}
