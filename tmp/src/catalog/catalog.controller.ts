import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { AuthGuard, RestaurantToken } from '../auth/auth.guard';
import { RestaurantOrCourierId } from '../auth/tokenExtractor';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) {}

    @Post() // +
    @RestaurantToken()
    @UseGuards(AuthGuard)
    create(@RestaurantOrCourierId() restaurantId: number, @Body() createCatalogItemDto: CreateCatalogItemDto) {
        return this.catalogService.create({ ...createCatalogItemDto, restaurantId });
    }

    @Patch(':id') // +
    @RestaurantToken()
    @UseGuards(AuthGuard)
    update(
        @RestaurantOrCourierId() restaurantId: number,
        @Param('id') id: string,
        @Body() updateCatalogDto: UpdateCatalogItemDto
    ) {
        return this.catalogService.update(+id, { ...updateCatalogDto, restaurantId });
    }
    @Get() // +
    @RestaurantToken()
    @UseGuards(AuthGuard)
    findAll(@RestaurantOrCourierId() restaurantId: number) {
        return this.catalogService.findAllRestaurantCatalogItems(restaurantId);
    }

    @Get(':id') // +
    @RestaurantToken()
    @UseGuards(AuthGuard)
    findOne(@RestaurantOrCourierId() restaurantId: number, @Param('id') id: string) {
        return this.catalogService.findOne(+id, restaurantId);
    }

    @Delete(':id')
    @RestaurantToken()
    @UseGuards(AuthGuard)
    remove(@RestaurantOrCourierId() restaurantId: number, @Param('id') id: string) {
        return this.catalogService.remove(+id, restaurantId);
    }
}
