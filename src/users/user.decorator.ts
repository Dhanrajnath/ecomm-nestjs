import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    console.log(`Executing ${ctx.getHandler().name} with arguments:`, request.user);
    return request.user;
})

export const GetUserEmail = createParamDecorator((data: string, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    console.log(`Executing ${ctx.getHandler().name} with arguments:`, request.user);
    const user = request.user;
    return data ? user?.[data] : user;
})