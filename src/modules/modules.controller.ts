import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilteredPaginationQueryDto } from '../common';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateModuleDto } from './dto/create-module.dto';
import { ModuleResponseDto } from './dto/module-response.dto';
import { PaginatedModuleResponseDto } from './dto/paginated-module-response.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesService } from './modules.service';

@Controller('modules')
@ApiTags('modules')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The module has been successfully created.',
    type: ModuleResponseDto,
  })
  async create(
    @Body() createModuleDto: CreateModuleDto,
  ): Promise<ModuleResponseDto> {
    return await this.modulesService.create(createModuleDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'A paginated list of modules.',
    type: PaginatedModuleResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination. Defaults to 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page. Defaults to 20, max 100.',
    example: 10,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    example: '2023-12-31T23:59:59.999Z',
  })
  async findAll(
    @Query() query: FilteredPaginationQueryDto,
  ): Promise<PaginatedModuleResponseDto> {
    return await this.modulesService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'A single module.',
    type: ModuleResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ModuleResponseDto> {
    return await this.modulesService.findOne(id);
  }

  @Get('course/:courseId')
  @ApiResponse({
    status: 200,
    description: 'A paginated list of modules for a course.',
    type: PaginatedModuleResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination. Defaults to 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page. Defaults to 20, max 100.',
    example: 10,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    example: '2023-12-31T23:59:59.999Z',
  })
  async findByCourseId(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query() query: FilteredPaginationQueryDto,
  ): Promise<PaginatedModuleResponseDto> {
    return this.modulesService.findByCourseId(courseId, query);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'The module has been successfully updated.',
    type: ModuleResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return await this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'The module has been successfully deleted.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.modulesService.remove(id);
  }
}
