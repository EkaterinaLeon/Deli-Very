import { IsDefined, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class CreateCatalogItemDto {
    @IsDefined()
    @IsString()
    @Length(1, 250)
    name: string;

    @IsDefined()
    @IsNumber()
    @IsPositive()
    price: number;

    @IsOptional()
    @Length(1, 2_000)
    description: string;
}
