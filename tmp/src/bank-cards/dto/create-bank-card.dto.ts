import { IsDefined, IsNumberString, Length, Matches } from 'class-validator';

export class CreateBankCardDto {
    @IsDefined()
    @IsNumberString()
    @Length(16, 16)
    cardNumber: string;

    @IsDefined()
    @Matches(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/)
    expireAt: string;
}
