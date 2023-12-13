export type TRestaurantId = { restaurantId: number };
export type TWithRestaurantId<T> = T & TRestaurantId;
