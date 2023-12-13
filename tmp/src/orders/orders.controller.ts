import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard, RestaurantToken } from '../auth/auth.guard';
import { RestaurantOrCourierId } from '../auth/tokenExtractor';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @RestaurantToken()
    @UseGuards(AuthGuard)
    async create(@RestaurantOrCourierId() restaurantId: number, @Body() createOrderDto: CreateOrderDto) {
        const order = await this.ordersService.create({ ...createOrderDto, restaurantId });
        return order;
    }

    @Patch(':id')
    @RestaurantToken()
    @UseGuards(AuthGuard)
    async update(
        @RestaurantOrCourierId() restaurantId: number,
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto
    ) {
        return this.ordersService.update(+id, { ...updateOrderDto, restaurantId });
    }

    @Get('restaurant')
    @RestaurantToken()
    @UseGuards(AuthGuard)
    findAll(@RestaurantOrCourierId() restaurantId: number) {
        return this.ordersService.findAllRestaurantOrders(restaurantId);
    }

    @Get('restaurant/:id')
    @RestaurantToken()
    @UseGuards(AuthGuard)
    async findOne(@RestaurantOrCourierId() restaurantId: number, @Param('id') id: string) {
        return this.ordersService.findOne(+id, restaurantId);
    }
}
