import {
    ArrayNotEmpty,
    IsDefined,
    IsISO8601,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MinLength,
    ValidateNested
} from 'class-validator';
import { CreateOrderCatalogItemDto } from './create-order-catalog-item.dto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
    @IsDefined()
    @IsString()
    @MinLength(1)
    address: string;

    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;

    @IsOptional()
    @IsISO8601()
    deliveryAt?: string;

    @IsDefined()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderCatalogItemDto)
    orderCatalogItems: CreateOrderCatalogItemDto[];
}
