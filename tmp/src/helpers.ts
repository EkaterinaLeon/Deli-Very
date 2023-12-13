import { CatalogItem } from './catalog/entities/catalog-item.entity';
import { ForbiddenException } from '@nestjs/common';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

export async function checkIfCatalogItemBelongsToRestaurant(
    entityTarget: EntityTarget<any>,
    entityId: CatalogItem['id'],
    restaurantId: number,
    manager: EntityManager
) {
    const catalogItem = await manager.findOne(entityTarget, {
        where: { id: entityId, restaurantId }
    });
    if (!catalogItem) {
        throw new ForbiddenException(
            `Entity with id ${entityId} does not belong to restaurant with id ${restaurantId}`
        );
    }
}
