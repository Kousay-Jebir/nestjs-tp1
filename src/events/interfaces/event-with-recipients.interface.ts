import { Event } from '../entities/event.entity';

export interface EventWithRecipients {
  event: Event;
  recipientIds?: number[];
}
