import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResourceType } from '../entities/lesson-resource.entity';
import { CreateLessonResourceDto } from './dto/create-lesson-resource.dto';
import { LessonResourceResponseDto } from './dto/lesson-resource-response.dto';
import { UpdateLessonResourceDto } from './dto/update-lesson-resource.dto';
import { LessonResourcesService } from './lesson-resources.service';

@Controller('lesson-resources')
@ApiTags('lesson-resources')
export class LessonResourcesController {
  constructor(
    private readonly lessonResourcesService: LessonResourcesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload a lesson resource file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Resource uploaded successfully',
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
        message: { type: 'string', example: 'No file provided' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() fileUploadDto: CreateLessonResourceDto,
  ): Promise<{
    message: string;
    data: LessonResourceResponseDto;
  }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const resource = await this.lessonResourcesService.create(
      file,
      fileUploadDto,
    );

    return {
      message: 'Lesson resource created successfully',
      data: resource,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all lesson resources' })
  @ApiResponse({
    status: 200,
    description: 'Resources retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'array' },
        count: { type: 'number' },
      },
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
  async findAll(@Query('type') type?: ResourceType): Promise<{
    message: string;
    data: LessonResourceResponseDto[];
    count: number;
  }> {
    let resources: LessonResourceResponseDto[];

    if (type) {
      resources = await this.lessonResourcesService.findByResourceType(type);
    } else {
      resources = await this.lessonResourcesService.findAll();
    }

    return {
      message: 'Lesson resources retrieved successfully',
      data: resources,
      count: resources.length,
    };
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get lesson resources by lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson resources retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'array' },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Lesson not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findByLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ): Promise<{
    message: string;
    data: LessonResourceResponseDto[];
    count: number;
  }> {
    const resources = await this.lessonResourcesService.findByLesson(lessonId);

    return {
      message: 'Lesson resources retrieved successfully',
      data: resources,
      count: resources.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson resource by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson resource retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Resource not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{
    message: string;
    data: LessonResourceResponseDto;
  }> {
    const resource = await this.lessonResourcesService.findOne(id);

    return {
      message: 'Lesson resource retrieved successfully',
      data: resource,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lesson resource by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson resource updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Resource not found or validation failed',
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonResourceDto: UpdateLessonResourceDto,
  ): Promise<{
    message: string;
    data: LessonResourceResponseDto;
  }> {
    const resource = await this.lessonResourcesService.update(
      id,
      updateLessonResourceDto,
    );

    return {
      message: 'Lesson resource updated successfully',
      data: resource,
    };
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Track resource download' })
  @ApiResponse({
    status: 200,
    description: 'Download tracked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Resource not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async trackDownload(@Param('id', ParseUUIDPipe) id: string): Promise<{
    message: string;
  }> {
    await this.lessonResourcesService.incrementDownloadCount(id);

    return {
      message: 'Download tracked successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete lesson resource' })
  @ApiResponse({ status: 204, description: 'Resource deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Resource not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.lessonResourcesService.softDelete(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete lesson resource' })
  @ApiResponse({
    status: 204,
    description: 'Resource permanently deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Resource not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.lessonResourcesService.permanentDelete(id);
  }
}
