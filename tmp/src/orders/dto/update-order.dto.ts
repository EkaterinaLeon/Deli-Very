import { IsEnum, IsISO8601, IsOptional, IsPhoneNumber, IsPositive, IsString, MinLength } from 'class-validator';

// статус заказа. 0 - новый(поиск), 1 - в работе(принят), 2 - доставлен(выполнен), 3 - отменен(завершен)
export const statuses = [0, 1, 2, 3] as const;
export type TStatues = (typeof statuses)[number];
export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    address?: string;

    @IsOptional()
    @IsPhoneNumber('RU')
    phoneNumber?: string;

    @IsOptional()
    @IsISO8601()
    deliveryAt?: string;

    @IsOptional()
    @IsEnum(statuses)
    status?: TStatues;

    @IsOptional()
    @IsPositive()
    finalPrice?: number;
}
