import { IsDefined, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;

    @IsDefined()
    // @IsStrongPassword()
    @IsString()
    @MinLength(6)
    password: string;
}
