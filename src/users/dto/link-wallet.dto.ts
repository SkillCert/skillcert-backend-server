import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class LinkWalletDto {
    @ApiProperty({
        description: 'Ethereum-compatible wallet address to link to the user account',
        example: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    })
    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    walletAddress: string;
}