import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @Exclude()
    password: string;
}

export class CreateUserDto extends AuthDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
export class AuthResponseDto {
    @Expose()
    id: string;

    @Expose()
    email: string;

    @Expose()
    name: string;

    @Exclude()
    password: string;
}