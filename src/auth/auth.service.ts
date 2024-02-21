import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SignInDto } from 'src/users/dto/sign-in-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signUp(createUserDto: CreateUserDto): Promise<void> {
        await this.usersService.create(createUserDto);
    }

    async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
        const { username, password } = signInDto;
        const user = await this.usersService.findUserName(username);

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload: JwtPayload = { username };
            const accessToken: string = await this.jwtService.sign(payload);
            return {
                accessToken
            }
        } else {
            throw new UnauthorizedException('Please check your login creds!');
        }
    }



}
