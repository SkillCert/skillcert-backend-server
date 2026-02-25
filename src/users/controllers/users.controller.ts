import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { LinkWalletDto } from '../dto/link-wallet.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UsersService } from '../providers/users.service';

@Controller('users')
@ApiTags('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /*
   * Brief description: Creates a new user in the system with the provided user data.
   * @param {CreateUserDto} createUserDto - Data transfer object containing user information to create a new user.
   * @returns {Promise<{message: string, data: UserResponseDto}>} A promise that resolves to an object with success message and the created user data.
   * @throws {Error} Validation error if the input data is invalid or if user creation fails.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request – invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict – email or wallet address already exists' })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.usersService.create(createUserDto);
    return { message: 'User created successfully', data: user };
  }

  /*
   * Brief description: Retrieves all users from the system with pagination support.
   * @returns {Promise<{message: string, data: UserResponseDto[], count: number}>} A promise that resolves to an object containing success message, array of users, and total count.
   * @throws {Error} Database error if the retrieval operation fails.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'array' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<{
    message: string;
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { users, total } = await this.usersService.findAll(pageNumber, limitNumber);

    return {
      message: 'Users retrieved successfully',
      data: users,
      total,
      page: pageNumber,
      limit: limitNumber,
    };
  }

  @Get('wallet/:address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a user by their linked wallet address' })
  @ApiParam({
    name: 'address',
    description: 'Ethereum-compatible wallet address',
    example: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({ status: 404, description: 'No user found with that wallet address' })
  async findByWalletAddress(
    @Param('address') address: string,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.usersService.findByWalletAddress(address);
    return { message: 'User retrieved successfully', data: user };
  }

  /*
   * Brief description: Retrieves a specific user by their unique identifier.
   * @param {string} id - The unique identifier of the user to retrieve.
   * @returns {Promise<{message: string, data: UserResponseDto}>} A promise that resolves to an object with success message and the user data.
   * @throws {Error} User not found error if the user with the specified ID does not exist.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(
    @Param('id') id: string,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.usersService.findById(id);
    return { message: 'User retrieved successfully', data: user };
  }

  /*
   * Brief description: Updates an existing user with the provided data.
   * @param {string} id - The unique identifier of the user to update.
   * @param {UpdateUserDto} updateUserDto - Data transfer object containing the updated user information.
   * @returns {Promise<{message: string, data: UserResponseDto}>} A promise that resolves to an object with success message and the updated user data.
   * @throws {Error} User not found error if the user with the specified ID does not exist, or validation error if the update data is invalid.
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request – invalid input data or user ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Conflict – email already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.usersService.update(id, updateUserDto);
    return { message: 'User updated successfully', data: user };
  }

  // PATCH /users/:id/wallet 

  @Patch(':id/wallet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link a Web3 wallet address to an existing user' })
  @ApiParam({ name: 'id', description: 'UUID of the user to update' })
  @ApiResponse({
    status: 200,
    description: 'Wallet linked successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, data: { type: 'object' } },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request – invalid address format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Conflict – wallet already linked to another account' })
  async linkWallet(
    @Param('id') id: string,
    @Body() linkWalletDto: LinkWalletDto,
  ): Promise<{ message: string; data: UserResponseDto }> {
    const user = await this.usersService.linkWallet(id, linkWalletDto);
    return { message: 'Wallet linked successfully', data: user };
  }

  /*
   * Brief description: Deletes a user from the system by their unique identifier.
   * @param {string} id - The unique identifier of the user to delete.
   * @returns {Promise<{message: string}>} A promise that resolves to an object with a success message confirming deletion.
   * @throws {Error} User not found error if the user with the specified ID does not exist.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
