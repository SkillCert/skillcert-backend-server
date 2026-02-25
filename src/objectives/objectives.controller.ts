import {
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
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { ObjectivesService } from './objectives.service';

@Controller('objectives')
@ApiTags('objectives')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new objective' })
  @ApiResponse({
    status: 201,
    description: 'Objective created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
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
        message: { type: 'string', example: 'Validation failed' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createObjectiveDto: CreateObjectiveDto) {
    const objective = await this.objectivesService.createObjetive(createObjectiveDto);
    return {
      success: true,
      message: 'Objective created successfully',
      data: objective,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all objectives' })
  @ApiResponse({
    status: 200,
    description: 'Objectives retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
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
  async findAll() {
    const objectives = await this.objectivesService.findAllObjectives();
    return {
      success: true,
      message: 'Objectives retrieved successfully',
      data: objectives,
    };
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get objectives by course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course objectives retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Course not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async findAllByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    const objectives = await this.objectivesService.findAllByCourse(courseId);
    return {
      success: true,
      message: 'Course objectives retrieved successfully',
      data: objectives,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get objective by ID' })
  @ApiResponse({
    status: 200,
    description: 'Objective retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
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
        message: { type: 'string', example: 'Objective not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const objective = await this.objectivesService.findOneObjective(id);
    return {
      success: true,
      message: 'Objective retrieved successfully',
      data: objective,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update objective by ID' })
  @ApiResponse({
    status: 200,
    description: 'Objective updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
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
          example: 'Objective not found or validation failed',
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    const objective = await this.objectivesService.updateObjective(
      id,
      updateObjectiveDto,
    );
    return {
      success: true,
      message: 'Objective updated successfully',
      data: objective,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete objective by ID' })
  @ApiResponse({ status: 204, description: 'Objective deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Objective not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.objectivesService.remove(id);
    return {
      success: true,
      message: 'Objective deleted successfully',
    };
  }

  @Put('course/:courseId/reorder')
  @ApiOperation({ summary: 'Reorder objectives for a course' })
  @ApiResponse({
    status: 200,
    description: 'Objectives reordered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
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
          example: 'Course not found or invalid objective IDs',
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async reorder(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body('objectiveIds') objectiveIds: string[],
  ) {
    const objectives = await this.objectivesService.reorder(
      courseId,
      objectiveIds,
    );
    return {
      success: true,
      message: 'Objectives reordered successfully',
      data: objectives,
    };
  }
}
