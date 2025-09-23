import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilteredPaginationQueryDto } from '../common';

@Controller('categories')
@ApiTags('categories')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Programming' },
            description: { type: 'string', example: 'Programming courses' },
            isActive: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<{
    message: string;
    data: Category;
  }> {
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Categories retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              name: { type: 'string', example: 'Programming' },
              description: { type: 'string', example: 'Programming courses' },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
        count: { type: 'number', example: 5 },
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
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination. Defaults to 1.', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page. Defaults to 20, max 100.', example: 10 })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for filtering (ISO 8601 format)', example: '2023-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for filtering (ISO 8601 format)', example: '2023-12-31T23:59:59.999Z' })
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: FilteredPaginationQueryDto): Promise<{
    message: string;
    data: Category[];
    total: number;
  }> {
    const { categories, total } = await this.categoriesService.findAll(query.page, query.limit, query);
    return {
      message: 'Categories retrieved successfully',
      data: categories,
      total,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active categories' })
  @ApiResponse({
    status: 200,
    description: 'Active categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Active categories retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              name: { type: 'string', example: 'Programming' },
              description: { type: 'string', example: 'Programming courses' },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
        count: { type: 'number', example: 3 },
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
  @HttpCode(HttpStatus.OK)
  async findActiveCategories(): Promise<{
    message: string;
    data: Category[];
    count: number;
  }> {
    const categories = await this.categoriesService.findActiveCategories();
    return {
      message: 'Active categories retrieved successfully',
      data: categories,
      count: categories.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Programming' },
            description: { type: 'string', example: 'Programming courses' },
            isActive: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid category ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category not found' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<{
    message: string;
    data: Category;
  }> {
    const category = await this.categoriesService.findById(id);
    return {
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Programming' },
            description: { type: 'string', example: 'Programming courses' },
            isActive: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or category ID',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category not found or validation failed',
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{
    message: string;
    data: Category;
  }> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid category ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category not found' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<{
    message: string;
  }> {
    await this.categoriesService.delete(id);
    return {
      message: 'Category deleted successfully',
    };
  }

  @Get(':id/courses-count')
  @ApiOperation({ summary: 'Get number of courses in category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category courses count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category courses count retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            categoryId: { type: 'string', example: 'uuid' },
            coursesCount: { type: 'number', example: 15 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid category ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category not found' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getCoursesCount(@Param('id') id: string): Promise<{
    message: string;
    data: { categoryId: string; coursesCount: number };
  }> {
    const coursesCount = await this.categoriesService.getCoursesCount(id);
    return {
      message: 'Category courses count retrieved successfully',
      data: { categoryId: id, coursesCount },
    };
  }
}
