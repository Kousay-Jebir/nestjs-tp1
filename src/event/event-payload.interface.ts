import { EntityType } from 'src/history/enum/entity-type.enum';
import { ActionTypeEnum } from 'src/history/enum/action-type.enum';

export interface EventPayload {
    entityType: EntityType;
    entityId: number;
    action: ActionTypeEnum;
    performedByUserId: number;
    timestamp?: Date;
}
