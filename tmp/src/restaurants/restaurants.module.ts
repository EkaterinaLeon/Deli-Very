import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { ConfigModule } from '@nestjs/config';
import { BankCardsModule } from '../bank-cards/bank-cards.module';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant]), ConfigModule, BankCardsModule],
    controllers: [RestaurantsController],
    providers: [RestaurantsService],
    exports: [RestaurantsService]
})
export class RestaurantsModule {}
