import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from './dto/login-dto';
import { AuthCode } from '../auth-codes/entities/auth-code.entity';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { BankCard } from '../bank-cards/entities/bank-card.entity';
@Injectable()
export class RestaurantsService {
    constructor(
        @InjectDataSource()
        public readonly dataSource: DataSource,
        public readonly configService: ConfigService
    ) {}
    private async getHash(password: string) {
        return bcrypt.hash(password, Number(this.configService.getOrThrow<number>('SALT_ROUNDS')));
    }

    createToken(data: { id: number; role: 'restaurant' | 'courier'; phoneNumber: string }) {
        return { token: jwt.sign(data, this.configService.getOrThrow<string>('JWT_SECRET')) };
    }
    async create(createRestaurantDto: CreateRestaurantDto) {
        const hashedPassword = await this.getHash(createRestaurantDto.password);
        return this.dataSource.manager.save(Restaurant, {
            phoneNumber: createRestaurantDto.phoneNumber,
            password: hashedPassword
        });
    }

    findByPhoneNumber(phoneNumber: string) {
        return this.dataSource.manager.findOne(Restaurant, {
            where: {
                phoneNumber
            }
        });
    }

    async login(loginAuthCodeDto: LoginDto) {
        const tokenData = await this.findByPhoneNumberAndPassword(
            loginAuthCodeDto.phoneNumber,
            loginAuthCodeDto.password
        );
        await this.dataSource.manager.delete(AuthCode, { phoneNumber: loginAuthCodeDto.phoneNumber });
        return tokenData;
    }

    async findByPhoneNumberAndPassword(phoneNumber: string, password: string) {
        const restaurant = await this.dataSource.manager.findOne(Restaurant, {
            where: {
                phoneNumber
            }
        });
        if (!restaurant) {
            throw new UnauthorizedException('Wrong credentials');
        }
        const isValidPassword = await bcrypt.compare(password, restaurant.password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Wrong credentials');
        }
        return this.createToken({ id: restaurant.id, role: 'restaurant', phoneNumber });
    }

    async update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
        await this.dataSource.manager.transaction('REPEATABLE READ', async manager => {
            const { bankCard, ...restData } = updateRestaurantDto;
            if (Object.keys(restData).length) {
                await manager.update(Restaurant, id, restData);
            }
            if (bankCard) {
                const currentRestaurant = await manager.findOneOrFail(Restaurant, {
                    where: { id },
                    relations: ['bankCard']
                });
                if (currentRestaurant.bankCard) {
                    // только 1 карта может быть у ресторана
                    await manager.update(BankCard, currentRestaurant.bankCard.id, bankCard);
                } else {
                    const { identifiers } = await manager.insert(BankCard, {
                        ...bankCard,
                        restaurant: currentRestaurant
                    });
                    await manager.update(Restaurant, id, { bankCardId: identifiers[0].id });
                }
            }
        });
    }
}
