import * as crypto from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthCodeDto } from './dto/create-auth-code.dto';
import * as process from 'process';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthCode } from './entities/auth-code.entity';
import { ConfirmAuthCodeDto } from './dto/confirm-auth-code.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { RegisterAuthCodeDto } from './dto/register-auth-codes-dto';

@Injectable()
export class AuthCodesService {
    constructor(
        @InjectDataSource()
        public readonly dataSource: DataSource,

        public readonly restaurantsService: RestaurantsService
    ) {}
    async create(createAuthCodeDto: CreateAuthCodeDto) {
        const { phoneNumber } = createAuthCodeDto;
        await this.dataSource.manager.delete(AuthCode, { phoneNumber });
        const code = Number(`${process.hrtime.bigint()}`.slice(-6));
        const authCode = await this.dataSource.manager.save(AuthCode, {
            code,
            phoneNumber,
            secret: crypto.randomUUID()
        });
        console.log('created auth code', authCode);
        return { code };
    }

    async confirm(confirmAuthCodeDto: ConfirmAuthCodeDto) {
        const { phoneNumber, code } = confirmAuthCodeDto;
        const authCode = await this.dataSource.manager.findOne(AuthCode, {
            where: {
                phoneNumber,
                code
            }
        });
        if (!authCode) {
            throw new NotFoundException(`Auth code for phone: ${phoneNumber} not found`);
        }
        /**
         * Если получает секрет - то надо отобразить старницу ввода пароля
         * Если получает моедль ресторана - то надо отобразить страницу логина(в модели уже будет телефон)
         */
        const restaurant = await this.restaurantsService.findByPhoneNumber(phoneNumber);
        if (restaurant) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...rest } = restaurant;
            return { restaurant: rest };
        }
        return { secret: authCode.secret };
    }

    async register(registerAuthCodeDto: RegisterAuthCodeDto) {
        const { phoneNumber, password, secret } = registerAuthCodeDto;
        const authCode = await this.dataSource.manager.findOne(AuthCode, {
            where: {
                phoneNumber,
                secret
            }
        });
        if (!authCode) {
            throw new NotFoundException(`Auth code for phone: ${phoneNumber} with specified secret not found`);
        }
        const newRestaurant = await this.restaurantsService.create({
            phoneNumber,
            password
        });
        await this.dataSource.manager.delete(AuthCode, { id: authCode.id });
        return this.restaurantsService.createToken({
            id: newRestaurant.id,
            role: 'restaurant',
            phoneNumber
        });
    }
}
