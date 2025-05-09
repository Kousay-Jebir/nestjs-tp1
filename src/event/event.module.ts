import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CustomEventEmitter } from './event-emitter.service';

@Module({
    imports: [EventEmitterModule.forRoot()],
    providers: [CustomEventEmitter],
    exports: [CustomEventEmitter],
})
export class EventsModule { }
