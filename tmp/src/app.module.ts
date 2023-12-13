import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthCodesModule } from './auth-codes/auth-codes.module';
import { TypeOrmConfigService } from './configs/type-orm-config/type-orm-config.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { BankCardsModule } from './bank-cards/bank-cards.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${process.env.NODE_ENV || 'test'}.env`,
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeOrmConfigService,
            inject: [ConfigService]
        }),
        AuthCodesModule,
        RestaurantsModule,
        BankCardsModule,
        CatalogModule,
        OrdersModule
    ]
})
export class AppModule {}
