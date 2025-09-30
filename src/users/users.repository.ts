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
    const user = this.userRepository.create(createUserDto);
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
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
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
}
