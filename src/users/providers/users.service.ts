import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUNDS } from '../../common/constants';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import type { User } from '../entities/user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const emailExists = await this.usersRepository.emailExists(
      createUserDto.email,
    );
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      PASSWORD_SALT_ROUNDS,
    );

    const userWithHashedPassword = {
      ...createUserDto,
      password: hashedPassword,
    };
    const saved = await this.usersRepository.create(userWithHashedPassword);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map((u) => this.toResponseDto(u));
  }

  async findById(id: string): Promise<UserResponseDto> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    // Check if user exists
    const userExists = await this.usersRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email) {
      const emailExists = await this.usersRepository.emailExists(
        updateUserDto.email,
        id,
      );
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        PASSWORD_SALT_ROUNDS,
      );
    }

    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const userExists = await this.usersRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
