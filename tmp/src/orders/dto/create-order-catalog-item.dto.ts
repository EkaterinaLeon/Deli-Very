import { IsDefined, IsNumber, Min } from 'class-validator';

export class CreateOrderCatalogItemDto {
    @IsDefined()
    @IsNumber()
    catalogItemId: number;

    @IsDefined()
    @IsNumber()
    @Min(1)
    quantity: number;
}
