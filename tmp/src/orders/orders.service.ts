import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { TWithRestaurantId } from '../types';
import { checkIfCatalogItemBelongsToRestaurant } from '../helpers';
import { OrderCatalogItem } from './entities/order-item.entity';
import { CatalogItem } from '../catalog/entities/catalog-item.entity';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

@Injectable()
export class OrdersService {
    constructor(
        @InjectDataSource()
        public readonly connection: DataSource
    ) {}

    private getExistingOrderWithRelations(manager: EntityManager, orderId: number) {
        return manager.getRepository(Order).findOneOrFail({
            where: { id: orderId },
            relations: {
                orderCatalogItems: {
                    catalogItem: true
                }
            }
        });
    }
    async create(createOrderDto: TWithRestaurantId<CreateOrderDto>) {
        return this.connection.manager.transaction('REPEATABLE READ', async manager => {
            const { restaurantId, orderCatalogItems, ...orderData } = createOrderDto;
            // созадаем заказ
            const createdOrderData = await manager.insert(Order, { ...orderData, restaurantId });
            const orderId = createdOrderData.identifiers[0].id;
            // добавляем в заказ блюда
            await Promise.all(
                orderCatalogItems.map(async ({ catalogItemId, quantity }) => {
                    await checkIfCatalogItemBelongsToRestaurant(CatalogItem, catalogItemId, restaurantId, manager);
                    await manager.insert(OrderCatalogItem, { orderId, catalogItemId, quantity });
                })
            );
            // вычисляем цену заказа
            const order = await this.getExistingOrderWithRelations(manager, orderId);
            const price = order.orderCatalogItems.reduce((acc, orderCatalogItem) => {
                return acc + orderCatalogItem.catalogItem.price * orderCatalogItem.quantity;
            }, 0);
            await manager.update(Order, { id: orderId }, { price, finalPrice: price });
            return this.getExistingOrderWithRelations(manager, orderId);
        });
    }

    findAllRestaurantOrders(restaurantId: number) {
        return this.connection.manager.getRepository(Order).find({
            where: { restaurantId },
            order: { status: 'ASC', deliveryAt: 'ASC' },
            relations: {
                orderCatalogItems: {
                    catalogItem: true
                }
            }
        });
    }

    async findOne(orderId: number, restaurantId: number) {
        return await this.connection.manager.transaction(async manager => {
            await checkIfCatalogItemBelongsToRestaurant(Order, orderId, restaurantId, manager);
            const order = manager.getRepository(Order).findOne({
                where: { id: orderId, restaurantId },
                relations: {
                    orderCatalogItems: {
                        catalogItem: true
                    }
                }
            });
            if (!order) {
                throw new NotFoundException(`Order with id ${orderId} does not exist`);
            }
            return order;
        });
    }

    async update(orderId: number, updateOrderDto: TWithRestaurantId<UpdateOrderDto>) {
        return await this.connection.manager.transaction('REPEATABLE READ', async manager => {
            const { restaurantId, ...orderData } = updateOrderDto;
            await checkIfCatalogItemBelongsToRestaurant(Order, orderId, restaurantId, manager);
            await manager.update(Order, { id: orderId }, orderData);
            return this.getExistingOrderWithRelations(manager, orderId);
        });
    }
}
