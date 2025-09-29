import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TEST_DATA } from '../common/constants';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin')
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Welcome to Admin Dashboard' },
        data: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number', example: 150 },
            totalCourses: { type: 'number', example: 25 },
            totalEnrollments: { type: 'number', example: 1200 },
            systemStatus: { type: 'string', example: 'Healthy' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request parameters' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  getDashboardPage() {
    return {
      message: 'Welcome to Admin Dashboard',
      data: {
        totalUsers: 150,
        totalCourses: TEST_DATA.TOTAL_COURSES,
        totalEnrollments: 1200,
        systemStatus: 'Healthy',
      },
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users for admin management' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User management - Admin/Moderator access required',
        },
        data: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '1' },
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  role: { type: 'string', example: 'user' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request parameters' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @HttpCode(HttpStatus.OK)
  getAllUsers() {
    return {
      message: 'User management - Admin/Moderator access required',
      data: {
        users: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'moderator',
          },
        ],
      },
    };
  }

  @Post('system/maintenance')
  @ApiOperation({ summary: 'Start system maintenance mode' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance mode started successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'System maintenance started - Admin access required',
        },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'Maintenance mode activated' },
            timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request parameters' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  startMaintenanceTime() {
    return {
      message: 'System maintenance started - Admin access required',
      data: {
        status: 'Maintenance mode activated',
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to delete',
    type: 'string',
    example: '1',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request parameters' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUserById(@Param('id') id: string) {
    return;
  }
  @Get('analytics')
  @ApiOperation({ summary: 'Get system analytics data' })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Analytics data - Admin/Moderator access required',
        },
        data: {
          type: 'object',
          properties: {
            monthlyStats: {
              type: 'object',
              properties: {
                newUsers: { type: 'number', example: 45 },
                courseCompletions: { type: 'number', example: 120 },
                revenue: { type: 'number', example: 15000 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid request parameters' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @HttpCode(HttpStatus.OK)
  getDataAnalytics() {
    return {
      message: 'Analytics data - Admin/Moderator access required',
      data: {
        monthlyStats: {
          newUsers: 45,
          courseCompletions: 120,
          revenue: 15000,
        },
      },
    };
  }
}
