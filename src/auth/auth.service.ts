import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/providers/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { WalletVerificationDto } from './dto/wallet-verification.dto';
import { Keypair } from 'stellar-sdk';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmailWithPassword(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
    async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    async verifyWallet(walletVerificationDto: WalletVerificationDto): Promise<{ accessToken: string }> {
        const { publicKey, signature, data } = walletVerificationDto;

        try {
            // 1. Verify the signature
            const keypair = Keypair.fromPublicKey(publicKey);
            const isValid = keypair.verify(Buffer.from(data), Buffer.from(signature, 'base64'));

            if (!isValid) {
                throw new UnauthorizedException('Invalid Stellar signature');
            }

            // 2. Find or create user
            let user = await this.usersService.findByStellarPublicKey(publicKey);

            if (!user) {
                // For demonstration, we create a user if they don't exist
                const name = `Stellar User ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
                const createdUser = await this.usersService.create({
                    name,
                    email: `${publicKey.toLowerCase()}@stellar.auth`,
                    password: Math.random().toString(36).slice(-10),
                });

                // Update the user with the public key
                const updatedUser = await this.usersService.update(createdUser.id, { stellarPublicKey: publicKey } as any);
                if (!updatedUser) {
                    throw new Error('Failed to update user with Stellar public key');
                }
                user = updatedUser as any;
            }

            if (!user) {
                throw new UnauthorizedException('User not found or could not be created');
            }

            // 3. Generate token
            const payload = { email: user.email, sub: user.id, role: user.role };
            return {
                accessToken: this.jwtService.sign(payload),
            };
        } catch (error: any) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Stellar authentication failed: ' + (error?.message || 'Unknown error'));
        }
    }
}
