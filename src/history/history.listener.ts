import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HistoryService } from './history.service';
import { EventPayload } from 'src/event/event-payload.interface';

@Injectable()
export class HistoryListener {
    constructor(private readonly history: HistoryService) { }

    // écoute tous les "entity.*"
    @OnEvent('entity.*')
    async handle(payload: EventPayload) {
        console.log("ehlo")
        await this.history.logEvent({
            entityType: payload.entityType,
            entityId: payload.entityId,
            action: payload.action,
            performedByUserId: payload.performedByUserId,
            timestamp: payload.timestamp ?? new Date(),
        });
    }
}
