import { IsDefined, IsPhoneNumber } from 'class-validator';

export class CreateAuthCodeDto {
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;
}
