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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UsersService } from '../providers/users.service';

@Controller('users')
@ApiTags('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*
   * Brief description: Creates a new user in the system with the provided user data.
   * @param {CreateUserDto} createUserDto - Data transfer object containing user information to create a new user.
   * @returns {Promise<{message: string, data: UserResponseDto}>} A promise that resolves to an object with success message and the created user data.
   * @throws {Error} Validation error if the input data is invalid or if user creation fails.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Validation failed' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    data: UserResponseDto;
  }> {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  /*
   * Brief description: Retrieves all users from the system with pagination support.
   * @returns {Promise<{message: string, data: UserResponseDto[], count: number}>} A promise that resolves to an object containing success message, array of users, and total count.
   * @throws {Error} Database error if the retrieval operation fails.
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
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
  async findAll(): Promise<{
    message: string;
    data: UserResponseDto[];
    count: number;
  }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { users, total } = await this.usersService.findAll(
      pageNumber,
      limitNumber,
    );

    return {
      message: 'Users retrieved successfully',
      data: users,
      total,
      page: pageNumber,
      limit: limitNumber,
    };
  }

  /*
   * Brief description: Retrieves a specific user by their unique identifier.
   * @param {string} id - The unique identifier of the user to retrieve.
   * @returns {Promise<{message: string, data: UserResponseDto}>} A promise that resolves to an object with success message and the user data.
   * @throws {Error} User not found error if the user with the specified ID does not exist.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid user ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<{
    message: string;
    data: UserResponseDto;
  }> {
    const user = await this.usersService.findById(id);
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  /*
   * Brief description: Updates an existing user with the provided data.
   * @param {string} id - The unique identifier of the user to update.
   * @param {UpdateUserDto} updateUserDto - Data transfer object containing the updated user information.
   * @returns {Promise<{message: string, data: UserResponseDto}>} A promise that resolves to an object with success message and the updated user data.
   * @throws {Error} User not found error if the user with the specified ID does not exist, or validation error if the update data is invalid.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or user ID',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User not found or validation failed',
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    data: UserResponseDto;
  }> {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  /*
   * Brief description: Deletes a user from the system by their unique identifier.
   * @param {string} id - The unique identifier of the user to delete.
   * @returns {Promise<{message: string}>} A promise that resolves to an object with a success message confirming deletion.
   * @throws {Error} User not found error if the user with the specified ID does not exist.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid user ID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<{
    message: string;
  }> {
    await this.usersService.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
