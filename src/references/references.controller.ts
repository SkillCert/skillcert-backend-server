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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Reference } from '../entities/reference.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { ReferenceResponseDto } from './dto/reference-response.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { ReferencesService } from './references.service';

@Controller('references')
@ApiTags('references')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReferencesController {
  constructor(private readonly referencesService: ReferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reference' })
  @ApiResponse({
    status: 201,
    description: 'Reference created successfully',
    type: Reference,
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
  /*
   * Description: Creates a new reference in the system.
   * @param {CreateReferenceDto} createReferenceDto - The data transfer object containing reference creation details.
   * @returns {Promise<ReferenceResponseDto>} A promise that resolves to the created reference response data.
   * @throws {Error} Throws validation error if the provided data is invalid.
   */
  create(
    @Body() createReferenceDto: CreateReferenceDto,
  ): Promise<ReferenceResponseDto> {
    return this.referencesService.create(createReferenceDto);
  }

  @Get()
  /*
   * Description: Retrieves all references from the system.
   * @returns {Promise<ReferenceResponseDto[]>} A promise that resolves to an array of all reference response data.
   */
  findAll(): Promise<ReferenceResponseDto[]> {
    return this.referencesService.findAll();
  }

  @Get(':id')
  /*
   * Description: Retrieves a specific reference by its unique identifier.
   * @param {string} id - The UUID of the reference to retrieve.
   * @returns {Promise<ReferenceResponseDto>} A promise that resolves to the reference response data.
   * @throws {Error} Throws error if the reference with the specified ID is not found.
   */
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReferenceResponseDto> {
    return this.referencesService.findOne(id);
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Get references by module ID' })
  @ApiResponse({
    status: 200,
    description: 'References retrieved successfully',
    type: [Reference],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Module not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  /*
   * Description: Retrieves all references associated with a specific module.
   * @param {string} moduleId - The UUID of the module to get references for.
   * @returns {Promise<ReferenceResponseDto[]>} A promise that resolves to an array of reference response data for the specified module.
   * @throws {Error} Throws error if the module with the specified ID is not found.
   */
  findByModule(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
  ): Promise<ReferenceResponseDto[]> {
    return this.referencesService.findByModule(moduleId);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get references by lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'References retrieved successfully',
    type: [Reference],
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
  /*
   * Description: Retrieves all references associated with a specific lesson.
   * @param {string} lessonId - The UUID of the lesson to get references for.
   * @returns {Promise<ReferenceResponseDto[]>} A promise that resolves to an array of reference response data for the specified lesson.
   * @throws {Error} Throws error if the lesson with the specified ID is not found.
   */
  findByLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ): Promise<ReferenceResponseDto[]> {
    return this.referencesService.findByLesson(lessonId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reference by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reference updated successfully',
    type: Reference,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Reference not found or validation failed',
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  /*
   * Description: Updates an existing reference with new data.
   * @param {string} id - The UUID of the reference to update.
   * @param {UpdateReferenceDto} updateReferenceDto - The data transfer object containing updated reference details.
   * @returns {Promise<ReferenceResponseDto>} A promise that resolves to the updated reference response data.
   * @throws {Error} Throws error if the reference is not found or validation fails.
   */
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReferenceDto: UpdateReferenceDto,
  ): Promise<ReferenceResponseDto> {
    return this.referencesService.update(id, updateReferenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reference by ID' })
  @ApiResponse({ status: 204, description: 'Reference deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Reference not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  /*
   * Description: Deletes a reference from the system by its unique identifier.
   * @param {string} id - The UUID of the reference to delete.
   * @returns {Promise<void>} A promise that resolves when the reference is successfully deleted.
   * @throws {Error} Throws error if the reference with the specified ID is not found.
   */
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.referencesService.remove(id);
  }
}
