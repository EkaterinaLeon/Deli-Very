import { IsDefined, IsPhoneNumber, IsPositive, Max, Min } from 'class-validator';

export class ConfirmAuthCodeDto {
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;

    @IsDefined()
    @IsPositive()
    @Min(100_000)
    @Max(999_999)
    code: number;
}
