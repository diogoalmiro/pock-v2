import { IsNotEmpty, IsString } from "class-validator";

export class UserCreateDto {
    @IsString()
    @IsNotEmpty()
    username?: string;

    @IsString()
    @IsNotEmpty()
    showName?: string;
}