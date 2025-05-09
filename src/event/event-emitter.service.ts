import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayload } from './event-payload.interface';

@Injectable()
export class CustomEventEmitter {
    constructor(private readonly emitter: EventEmitter2) { }

    emitEvent(payload: EventPayload) {
        this.emitter.emit(`entity.${payload.entityType}`, payload);
    }
}
