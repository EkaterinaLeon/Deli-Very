import { IsDefined, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterAuthCodeDto {
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;

    @IsDefined()
    // @IsStrongPassword()
    @IsString()
    @MinLength(6)
    password: string;

    @IsDefined()
    @IsString()
    secret: string;
}
