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
  ) { }

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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      // Normalise wallet address to lowercase for consistent uniqueness checks
      walletAddress: createUserDto.walletAddress
        ? createUserDto.walletAddress.toLowerCase()
        : null,
    });
    return await this.userRepository.save(user);
  }

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
        'user.walletAddress',
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

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'walletAddress', 'createdAt', 'updatedAt'],
    });
  }

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

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findByStellarPublicKey(stellarPublicKey: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { stellarPublicKey },
    });
  }

  /**
   * Used specifically for authentication to retrieve the user's hashed password.
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  /** Find a user by their linked wallet address (case-insensitive). */
  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      select: ['id', 'name', 'email', 'role', 'walletAddress', 'createdAt', 'updatedAt'],
    });
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findById(id);
  }

  /** Persist only the walletAddress field for an existing user. */
  async linkWallet(id: string, walletAddress: string): Promise<User | null> {
    await this.userRepository.update(id, {
      walletAddress: walletAddress.toLowerCase(),
    });
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { id } });
    return count > 0;
  }

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

  async walletExists(walletAddress: string, excludeId?: string): Promise<boolean> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.walletAddress = :walletAddress', {
        walletAddress: walletAddress.toLowerCase(),
      });

    if (excludeId) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}