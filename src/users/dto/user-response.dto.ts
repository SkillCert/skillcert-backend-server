// users/dto/user-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
export { UserRole } from '../enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Stellar public key linked to the user account',
    example: 'GB...',
    nullable: true,
  })
  stellarPublicKey: string | null;

  @ApiPropertyOptional({
    description: 'Linked Web3 wallet address',
    example: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    nullable: true,
  })
  walletAddress: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
