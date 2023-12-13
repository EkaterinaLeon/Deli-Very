import { Controller, Post, Body, Put, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { LoginDto } from './dto/login-dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantOrCourierId } from '../auth/tokenExtractor';
import { AuthGuard, RestaurantToken } from '../auth/auth.guard';

@Controller('restaurants')
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) {}

    @Post('login')
    login(@Body() createRestaurantDto: LoginDto) {
        return this.restaurantsService.login(createRestaurantDto);
    }

    @Put()
    @RestaurantToken()
    @UseGuards(AuthGuard)
    update(@RestaurantOrCourierId() restaurantId: number, @Body() updateRestaurantDto: UpdateRestaurantDto) {
        return this.restaurantsService.update(restaurantId, updateRestaurantDto);
    }
}
