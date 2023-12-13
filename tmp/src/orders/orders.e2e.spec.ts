import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { mainConfig } from '../main.config';
import { AppModule } from '../app.module';
import { createRestaurant } from '../restaurants/restaurants.e2e.spec';
import { createCatalogItem } from '../catalog/catalog.e2e.spec';
import { CreateOrderDto } from './dto/create-order.dto';
import * as request from 'supertest';
import { Order } from './entities/order.entity';
import { UpdateOrderDto } from './dto/update-order.dto';

async function create3CatalogItems(app: INestApplication, token: string) {
    const item1 = await createCatalogItem(app, token, {
        name: 'Картофель фри',
        description: 'Картофель фри с соусом',
        price: 300
    });
    const item2 = await createCatalogItem(app, token, {
        name: 'Гамбургер',
        description: 'Гамбургер с сыром',
        price: 500
    });
    const item3 = await createCatalogItem(app, token, {
        name: 'Торт',
        description: 'Торт вишня',
        price: 700
    });
    return [item1, item2, item3];
}

async function createOrder(app: INestApplication, token: string, createOrderDto: CreateOrderDto) {
    const { body, status } = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(createOrderDto);
    expect(status).toBe(201);
    return body as Order;
}
async function updateOrder(app: INestApplication, token: string, id: number, updateOrderDto: UpdateOrderDto) {
    const { body, status } = await request(app.getHttpServer())
        .patch(`/orders/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateOrderDto);
    expect(status).toBe(200);
    return body as Order;
}

async function getOrders(app: INestApplication, token: string) {
    const { body, status } = await request(app.getHttpServer())
        .get('/orders/restaurant')
        .set('Authorization', `Bearer ${token}`);
    expect(status).toBe(200);
    return body as Order[];
}

async function getOrder(app: INestApplication, token: string, id: number) {
    const { body, status } = await request(app.getHttpServer())
        .get(`/orders/restaurant/${id}`)
        .set('Authorization', `Bearer ${token}`);
    expect(status).toBe(200);
    return body as Order[];
}
describe('orders', () => {
    let app: INestApplication;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        mainConfig(app);
        await app.init();
    });
    // создаем заказ
    it(`[POST] /`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        const catalogItems = await create3CatalogItems(app, token);
        const order = await createOrder(app, token, {
            address: 'ул. Пушкина, дом Колотушкина',
            phoneNumber: '+79780000004',
            orderCatalogItems: [
                {
                    // фри - 1 шт - 300 руб
                    catalogItemId: catalogItems[0].id,
                    quantity: 1
                },
                {
                    // гамбургер - 2 шт - 500 руб * 2 = 1000 руб
                    catalogItemId: catalogItems[1].id,
                    quantity: 2
                }
            ]
        });
        expect(order).toMatchObject({
            id: expect.any(Number),
            restaurantId: expect.any(Number),
            address: 'ул. Пушкина, дом Колотушкина',
            phoneNumber: '+79780000004',
            deliveryAt: null,
            status: 0,
            price: 1300,
            finalPrice: 1300,
            orderCatalogItems: [
                {
                    catalogItem: {
                        id: catalogItems[0].id,
                        name: 'Картофель фри',
                        description: 'Картофель фри с соусом',
                        price: 300
                    },
                    quantity: 1
                },
                {
                    catalogItem: {
                        id: catalogItems[1].id,
                        name: 'Гамбургер',
                        description: 'Гамбургер с сыром',
                        price: 500
                    },
                    quantity: 2
                }
            ]
        });
    });
    // редактируем заказ
    it(`[PATCH] /:id`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        const catalogItems = await create3CatalogItems(app, token);
        const order = await createOrder(app, token, {
            address: 'ул. Пушкина, дом Колотушкина',
            phoneNumber: '+79780000004',
            orderCatalogItems: [
                {
                    // фри - 1 шт - 300 руб
                    catalogItemId: catalogItems[0].id,
                    quantity: 1
                },
                {
                    // гамбургер - 2 шт - 500 руб * 2 = 1000 руб
                    catalogItemId: catalogItems[1].id,
                    quantity: 2
                }
            ]
        });
        const updatedOrder = await updateOrder(app, token, order.id, {
            address: 'ул. Пушкина, дом Колотушкина, кв. 1',
            deliveryAt: '2021-08-01T12:00:00.000Z',
            finalPrice: 1500,
            status: 3
        });
        expect(updatedOrder).toMatchObject({
            id: order.id,
            restaurantId: expect.any(Number),
            address: 'ул. Пушкина, дом Колотушкина, кв. 1',
            phoneNumber: '+79780000004',
            deliveryAt: '2021-08-01T12:00:00.000Z',
            status: 3,
            price: 1300,
            finalPrice: 1500,
            orderCatalogItems: [
                {
                    catalogItem: {
                        id: catalogItems[0].id,
                        name: 'Картофель фри',
                        description: 'Картофель фри с соусом',
                        price: 300
                    },
                    quantity: 1
                },
                {
                    catalogItem: {
                        id: catalogItems[1].id,
                        name: 'Гамбургер',
                        description: 'Гамбургер с сыром',
                        price: 500
                    },
                    quantity: 2
                }
            ]
        });
    });
    // Получение всех заказов ресторана
    it(`[GET] /restaurant`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        const catalogItems = await create3CatalogItems(app, token);
        const order1 = await createOrder(app, token, {
            address: 'ул. Пушкина, дом Колотушкина',
            phoneNumber: '+79780000004',
            orderCatalogItems: [
                {
                    // фри - 1 шт - 300 руб
                    catalogItemId: catalogItems[0].id,
                    quantity: 1
                },
                {
                    // гамбургер - 2 шт - 500 руб * 2 = 1000 руб
                    catalogItemId: catalogItems[1].id,
                    quantity: 2
                }
            ]
        });
        const order2 = await createOrder(app, token, {
            address: 'ул. Дружбы, дом 4',
            phoneNumber: '+79780000005',
            orderCatalogItems: [
                {
                    // торт - 3 шт - 700 руб * 3 = 2100 руб
                    catalogItemId: catalogItems[2].id,
                    quantity: 3
                }
            ]
        });
        const orders = await getOrders(app, token);
        expect(orders).toMatchObject([
            {
                id: order1.id,
                restaurantId: expect.any(Number),
                address: 'ул. Пушкина, дом Колотушкина',
                phoneNumber: '+79780000004',
                deliveryAt: null,
                status: 0,
                price: 1300,
                finalPrice: 1300,
                orderCatalogItems: [
                    {
                        catalogItem: {
                            id: catalogItems[0].id,
                            name: 'Картофель фри',
                            description: 'Картофель фри с соусом',
                            price: 300
                        },
                        quantity: 1
                    },
                    {
                        catalogItem: {
                            id: catalogItems[1].id,
                            name: 'Гамбургер',
                            description: 'Гамбургер с сыром',
                            price: 500
                        },
                        quantity: 2
                    }
                ]
            },
            {
                id: order2.id,
                restaurantId: expect.any(Number),
                address: 'ул. Дружбы, дом 4',
                phoneNumber: '+79780000005',
                deliveryAt: null,
                status: 0,
                price: 2100,
                finalPrice: 2100,
                orderCatalogItems: [
                    {
                        catalogItem: {
                            id: catalogItems[2].id,
                            name: 'Торт',
                            description: 'Торт вишня',
                            price: 700
                        },
                        quantity: 3
                    }
                ]
            }
        ]);
    });
    // Получение одного указанного заказа ресторана
    it(`[GET] /restaurant/:id`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        const catalogItems = await create3CatalogItems(app, token);
        await createOrder(app, token, {
            address: 'ул. Пушкина, дом Колотушкина',
            phoneNumber: '+79780000004',
            orderCatalogItems: [
                {
                    // фри - 1 шт - 300 руб
                    catalogItemId: catalogItems[0].id,
                    quantity: 1
                },
                {
                    // гамбургер - 2 шт - 500 руб * 2 = 1000 руб
                    catalogItemId: catalogItems[1].id,
                    quantity: 2
                }
            ]
        });
        const order2 = await createOrder(app, token, {
            address: 'ул. Дружбы, дом 4',
            phoneNumber: '+79780000005',
            orderCatalogItems: [
                {
                    // торт - 3 шт - 700 руб * 3 = 2100 руб
                    catalogItemId: catalogItems[2].id,
                    quantity: 3
                }
            ]
        });
        const order = await getOrder(app, token, order2.id);
        expect(order).toMatchObject({
            id: order2.id,
            restaurantId: expect.any(Number),
            address: 'ул. Дружбы, дом 4',
            phoneNumber: '+79780000005',
            deliveryAt: null,
            status: 0,
            price: 2100,
            finalPrice: 2100,
            orderCatalogItems: [
                {
                    catalogItem: {
                        id: catalogItems[2].id,
                        name: 'Торт',
                        description: 'Торт вишня',
                        price: 700
                    },
                    quantity: 3
                }
            ]
        });
    });
    afterEach(async () => {
        await app.close();
    });
});
