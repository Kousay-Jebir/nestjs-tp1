import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Event, EventType } from './entities/event.entity';
import { Role } from '../user/enums/role.enum';
import { UserInfo } from './interfaces/user-info.interface';
import { EventWithRecipients } from './interfaces/event-with-recipients.interface';

@Injectable()
export class EventsGateway {
  private eventSubject = new Subject<EventWithRecipients>();

  notifyEvent(event: Event, recipientIds?: number[]): void {
    this.eventSubject.next({ event, recipientIds });
  }

  subscribe(user: UserInfo): Observable<Event> {
    return this.eventSubject.pipe(
      filter((eventData) => {
        // Admin can see all events
        if (user.role === Role.ADMIN.toString()) {
          return true;
        }

        // Users can only see events for CVs they created
        const isOwner = eventData.event.cv?.user?.id === user.userId;
        const isRecipient =
          eventData.recipientIds?.includes(user.userId) ?? false;

        return Boolean(isOwner || isRecipient);
      }),
      map((eventData) => eventData.event),
    );
  }
}
