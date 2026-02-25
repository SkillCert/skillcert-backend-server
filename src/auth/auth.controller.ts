import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { WalletVerificationDto } from './dto/wallet-verification.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user and return JWT token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
    })
    async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User registered successfully',
        type: UserResponseDto,
    })
    async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.authService.register(createUserDto);
    }

    @Public()
    @Post('wallet/verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify Stellar wallet signature and return JWT' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Verification successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid Stellar signature',
    })
    async verifyWallet(@Body() walletVerificationDto: WalletVerificationDto): Promise<{ accessToken: string }> {
        return this.authService.verifyWallet(walletVerificationDto);
    }
}
