import { UseInterceptors, UseGuards, Controller, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { LoggingInterceptor } from "src/logging/logging.interceptor";
import { TimeoutInterceptor } from "src/timeout/timeout.interceptor";
import { UsersService } from "./users.service";
import { GetUser, GetUserEmail } from "./user.decorator";
import { User } from "./entities/user.entity";

@UseInterceptors(LoggingInterceptor, TimeoutInterceptor)
@UseGuards(AuthGuard())
@Controller({ version: '2', path: 'users' })
export class Users2Controller {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findUser(@GetUser() user: User) {
        // console.log(user);
        return user.email;
    }
}