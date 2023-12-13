import { Module } from '@nestjs/common';
import { AuthCodesService } from './auth-codes.service';
import { AuthCodesController } from './auth-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCode } from './entities/auth-code.entity';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
    imports: [TypeOrmModule.forFeature([AuthCode]), RestaurantsModule],
    controllers: [AuthCodesController],
    providers: [AuthCodesService]
})
export class AuthCodesModule {}
