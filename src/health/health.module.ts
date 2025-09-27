import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { ServiceHealthIndicator } from './indicators/service-health.indicator';
import { Course } from '../entities/course.entity';
import { Category } from '../entities/category.entity';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forFeature([Course, Category]),
  ],
  controllers: [
    HealthController,
  ],
  providers: [ServiceHealthIndicator],
})
export class HealthModule {}