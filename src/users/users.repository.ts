import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { DateRangeFilterDto } from '../common/dto/date-range-filter.dto';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /*
   * Brief description: Applies date range filters to a user query builder.
   * @param {SelectQueryBuilder<User>} queryBuilder - The TypeORM query builder to apply filters to.
   * @param {DateRangeFilterDto} filters - The date range filters to apply.
   * @returns {SelectQueryBuilder<User>} The query builder with applied date filters.
   */
  private applyDateFilters(
    queryBuilder: SelectQueryBuilder<User>,
    filters: DateRangeFilterDto,
  ): SelectQueryBuilder<User> {
    if (filters.startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    return queryBuilder;
  }

  /*
   * Brief description: Creates a new user in the database.
   * @param {CreateUserDto} createUserDto - The data transfer object containing the user information.
   * @returns {Promise<User>} A promise that resolves to the created user entity.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  /*
   * Brief description: Retrieves all users with optional pagination and date filters.
   * @param {number} page - Optional page number for pagination.
   * @param {number} limit - Optional number of items per page.
   * @param {DateRangeFilterDto} filters - Optional date range filters.
   * @returns {Promise<{ users: User[]; total: number }>} A promise that resolves to an object containing the users array and total count.
   */
  async findAll(
    page?: number,
    limit?: number,
    filters?: DateRangeFilterDto,
  ): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
      ])
      .orderBy('user.createdAt', 'DESC');

    if (filters) {
      this.applyDateFilters(queryBuilder, filters);
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [users, total] = await queryBuilder.getManyAndCount();
    return { users, total };
  }

  /*
   * Brief description: Finds a user by their ID.
   * @param {string} id - The ID of the user to find.
   * @returns {Promise<User | null>} A promise that resolves to the found user or null if not found.
   */
  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    });
  }

  /*
   * Brief description: Finds a user by ID or throws an error if not found.
   * @param {string} id - The ID of the user to find.
   * @param {() => never} onNotFound - Optional callback to handle not found case.
   * @returns {Promise<User>} A promise that resolves to the found user.
   * @throws {BadRequestException} When user is not found and no onNotFound callback is provided.
   */
  async findByIdOrThrow(id: string, onNotFound?: () => never): Promise<User> {
    const user = await this.findById(id);
    if (user) {
      return user;
    }

    if (onNotFound) {
      return onNotFound();
    }

    throw new BadRequestException('cannot find user');
  }

  /*
   * Brief description: Finds a user by their email address.
   * @param {string} email - The email address to search for.
   * @returns {Promise<User | null>} A promise that resolves to the found user or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  /*
   * Brief description: Updates a user's information in the database.
   * @param {string} id - The ID of the user to update.
   * @param {UpdateUserDto} updateUserDto - The data transfer object containing the updated user information.
   * @returns {Promise<User | null>} A promise that resolves to the updated user or null if not found.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findById(id);
  }

  /*
   * Brief description: Deletes a user from the database.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the user was deleted, false otherwise.
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /*
   * Brief description: Checks if a user exists by their ID.
   * @param {string} id - The ID of the user to check.
   * @returns {Promise<boolean>} A promise that resolves to true if the user exists, false otherwise.
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { id } });
    return count > 0;
  }

  /*
   * Brief description: Checks if an email address is already registered to a user.
   * @param {string} email - The email address to check.
   * @param {string} excludeId - Optional user ID to exclude from the check (useful for updates).
   * @returns {Promise<boolean>} A promise that resolves to true if the email exists, false otherwise.
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeId) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
