import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('public')
@ApiTags('public')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PublicController {
  @Get('info')
  @ApiOperation({ summary: 'Get public application information' })
  @ApiResponse({
    status: 200,
    description: 'Public information retrieved successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  /*
   *  Retrieves public information about the application including app name, version, and available features.
   * @returns {Promise<Object>} Returns an object containing a success message and application data
   *                           including appName, version, description, and list of features.
   * @throws {UnauthorizedException} If the user is not authenticated or lacks admin role.
   */
  getPublicInfo() {
    return {
      message: 'This is public information - no authentication required',
      data: {
        appName: 'SkillCert Learning Platform',
        version: '1.0.0',
        description: 'A comprehensive learning management system',
        features: [
          'Course Management',
          'User Enrollment',
          'Progress Tracking',
          'Quiz System',
          'File Resources',
        ],
      },
    };
  }

  @Get('courses')
  @HttpCode(HttpStatus.OK)
  /*
   *  Retrieves a list of publicly available courses from the platform.
   * @returns {Promise<Object>} Returns an object containing a success message and an array of courses,
   *                           each with id, title, description, category, and publication status.
   * @throws {UnauthorizedException} If the user is not authenticated or lacks admin role.
   */
  getPublicCourses() {
    return {
      message: 'Public course catalog - no authentication required',
      data: {
        courses: [
          {
            id: '1',
            title: 'Introduction to Web Development',
            description: 'Learn the basics of web development',
            category: 'Web Development',
            isPublished: true,
          },
          {
            id: '2',
            title: 'JavaScript Fundamentals',
            description: 'Master JavaScript programming',
            category: 'Programming',
            isPublished: true,
          },
        ],
      },
    };
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  /*
   *  Retrieves a list of all available course categories with their styling information.
   * @returns {Promise<Object>} Returns an object containing a success message and an array of categories,
   *                           each with id, name, and associated color code.
   * @throws {UnauthorizedException} If the user is not authenticated or lacks admin role.
   */
  getPublicCategories() {
    return {
      message: 'Public course categories - no authentication required',
      data: {
        categories: [
          { id: '1', name: 'Web Development', color: '#FF6B6B' },
          { id: '2', name: 'Programming', color: '#4ECDC4' },
          { id: '3', name: 'Data Science', color: '#45B7D1' },
          { id: '4', name: 'Design', color: '#96CEB4' },
        ],
      },
    };
  }
}
