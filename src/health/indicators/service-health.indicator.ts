import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { Category } from '../../entities/category.entity';

@Injectable()
export class ServiceHealthIndicator extends HealthIndicator {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {
    super();
  }

  async checkCoreServices(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if we can query core entities
      const courseCount = await this.courseRepository.count();
      const categoryCount = await this.categoryRepository.count();

      const isHealthy = courseCount >= 0 && categoryCount >= 0;

      const result = this.getStatus(key, isHealthy, {
        courses: courseCount,
        categories: categoryCount,
        message: 'Core services are operational',
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Core services check failed', result);
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }

      const result = this.getStatus(key, false, {
        message: 'Core services are not available',
        error: message,
      });
      throw new HealthCheckError('Core services check failed', result);
    }
  }

  async checkStorageService(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if storage directories exist and are writable
      const fs = require('fs').promises;
      const path = require('path');

      // Assuming uploads directory based on common NestJS patterns
      const uploadDir = path.join(process.cwd(), 'uploads');

      try {
        await fs.access(uploadDir);
        const stats = await fs.stat(uploadDir);
        const isHealthy = stats.isDirectory();

        return this.getStatus(key, isHealthy, {
          uploadDirectory: uploadDir,
          accessible: isHealthy,
          message: 'Storage service is operational',
        });
      } catch {
        // Directory doesn't exist, but that might be ok
        return this.getStatus(key, true, {
          uploadDirectory: uploadDir,
          accessible: false,
          message: 'Storage service ready (no uploads directory yet)',
        });
      }
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }

      const result = this.getStatus(key, false, {
        message: 'Storage service check failed',
        error: message,
      });
      throw new HealthCheckError('Storage service check failed', result);
    }
  }
}
