import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { CreateBankCardDto } from '../../bank-cards/dto/create-bank-card.dto';
import { Type } from 'class-transformer';

class UpdateRestaurantDtoBase {
    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @MinLength(1)
    address: string;

    @IsString()
    @IsEmail()
    email: string;

    @ValidateNested()
    @Type(() => CreateBankCardDto)
    bankCard: CreateBankCardDto;
}
export class UpdateRestaurantDto extends PartialType(UpdateRestaurantDtoBase) {}
