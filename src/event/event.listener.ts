// src/cv-history/cv-history.listener.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActionEvent } from '../event/event';
import {HistoryService } from '../history/history.service';

@EventsHandler(ActionEvent)
export class CvActionEventHandler implements IEventHandler<ActionEvent> {
  constructor(private readonly historyService:HistoryService) {}

  async handle(event: ActionEvent) {
    const { entityId, action, userId } = event;
    await this.historyService.log(entityId, action, userId);
  }
}
