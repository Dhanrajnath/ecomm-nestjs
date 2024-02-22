import { Body, Controller, HttpCode, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoggingInterceptor } from '../logging/logging.interceptor';
import { TimeoutInterceptor } from '../timeout/timeout.interceptor';
import { SignInDto } from '../users/dto/sign-in-user.dto';
// import { AuthGuard } from '@nestjs/passport';

@UseInterceptors(LoggingInterceptor, TimeoutInterceptor)
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('/signup')
    @HttpCode(201)
    signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<void> {
        return this.authService.signUp(createUserDto);
    }

    @Post('/signin')
    @HttpCode(201)
    signIn(@Body(new ValidationPipe()) signInDto: SignInDto): Promise<{ accessToken: string }> {
        return this.authService.signIn(signInDto);
    }

}

