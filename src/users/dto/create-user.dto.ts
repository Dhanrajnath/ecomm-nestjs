import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsStrongPassword } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsStrongPassword(
        { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
        { message: "password must contain 1 upper case, 1 number, 1 symbol and min length of 8 chars" }
    )
    password: string;

}
