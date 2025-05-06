import { Controller, Get, Param, UseGuards, Sse } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { User } from '../auth/decorators/user.decorator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventsGateway } from './events.gateway';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('my-events')
  findMyEvents(@User('userId') userId: number) {
    return this.eventsService.findAllByUser(userId);
  }

  @Get('cv/:id')
  findByCv(@Param('id') id: string) {
    return this.eventsService.findAllByCv(+id);
  }

  @Sse('subscribe')
  subscribeToEvents(@User() user: any): Observable<MessageEvent> {
    return this.eventsGateway.subscribe(user).pipe(
      map(
        (event) =>
          ({
            data: event,
          }) as MessageEvent,
      ),
    );
  }
}
