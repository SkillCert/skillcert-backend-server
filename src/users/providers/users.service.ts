import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
// Constants
import { PASSWORD_SALT_ROUNDS } from '../../common/constants';
import { CreateUserDto } from '../dto/create-user.dto';
import { LinkWalletDto } from '../dto/link-wallet.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import type { User } from '../entities/user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      stellarPublicKey: user.stellarPublicKey ?? null,
      walletAddress: user.walletAddress ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const emailExists = await this.usersRepository.emailExists(createUserDto.email);
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Validate wallet uniqueness if provided at creation time
    if (createUserDto.walletAddress) {
      const walletExists = await this.usersRepository.walletExists(createUserDto.walletAddress);
      if (walletExists) {
        throw new ConflictException('Wallet address is already linked to another account');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, PASSWORD_SALT_ROUNDS);

    const saved = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.toResponseDto(saved);
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const { users, total } = await this.usersRepository.findAll(page, limit);
    return { users: users.map((u) => this.toResponseDto(u)), total };
  }

  async findById(id: string): Promise<UserResponseDto> {
    if (!id) throw new BadRequestException('User ID is required');

    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return this.toResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    if (!id) throw new BadRequestException('User ID is required');

    const userExists = await this.usersRepository.exists(id);
    if (!userExists) throw new NotFoundException(`User with ID ${id} not found`);

    if (updateUserDto.email) {
      const emailExists = await this.usersRepository.emailExists(updateUserDto.email, id);
      if (emailExists) throw new ConflictException('Email already exists');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, PASSWORD_SALT_ROUNDS);
    }

    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    if (!updatedUser) throw new NotFoundException(`User with ID ${id} not found`);

    return this.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new BadRequestException('User ID is required');

    const userExists = await this.usersRepository.exists(id);
    if (!userExists) throw new NotFoundException(`User with ID ${id} not found`);

    const deleted = await this.usersRepository.delete(id);
    if (!deleted) throw new NotFoundException(`User with ID ${id} not found`);
  }

  /**
   * Fetch a user by their linked wallet address.
   * Address comparison is case-insensitive (stored lowercase in DB).
   */
  async findByWalletAddress(walletAddress: string): Promise<UserResponseDto> {
    if (!walletAddress) throw new BadRequestException('Wallet address is required');

    const user = await this.usersRepository.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`No user found with wallet address ${walletAddress}`);
    }

    return this.toResponseDto(user);
  }

  /**
   * Internal method used solely by AuthModule to validate credentials.
   * Returns the user entity including the hashed password.
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmailWithPassword(email);
  }

  async findByStellarPublicKey(publicKey: string): Promise<User | null> {
    return await this.usersRepository.findByStellarPublicKey(publicKey);
  }

  /**
   * Link a Web3 wallet address to an existing user profile.
   * Ensures the address is not already taken by another account.
   */
  async linkWallet(id: string, { walletAddress }: LinkWalletDto): Promise<UserResponseDto> {
    if (!id) throw new BadRequestException('User ID is required');

    // Ensure the target user exists
    const userExists = await this.usersRepository.exists(id);
    if (!userExists) throw new NotFoundException(`User with ID ${id} not found`);

    // Prevent duplicate wallet links across accounts
    const walletTaken = await this.usersRepository.walletExists(walletAddress, id);
    if (walletTaken) {
      throw new ConflictException('Wallet address is already linked to another account');
    }

    const updatedUser = await this.usersRepository.linkWallet(id, walletAddress);
    if (!updatedUser) throw new NotFoundException(`User with ID ${id} not found`);

    return this.toResponseDto(updatedUser);
  }
}
