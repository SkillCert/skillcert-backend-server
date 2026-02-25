import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Stellar public key linked to the user account',
    example: 'GB...',
  })
  @IsOptional()
  @IsString()
  @MinLength(56)
  stellarPublicKey?: string;

  @ApiPropertyOptional({
    description: 'Ethereum-compatible wallet address',
    example: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  })
  @IsOptional()
  @IsString()
  @IsEthereumAddress()
  walletAddress?: string;
}
