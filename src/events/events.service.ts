import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventType } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Cv } from '../cv/entities/cv.entity';
import { SharedService } from '../services/shared.service';

@Injectable()
export class EventsService extends SharedService<Event> {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {
    super(eventRepository);
  }

  async createEvent(
    type: EventType,
    user: User,
    cv: Cv,
    details?: Record<string, any>,
  ): Promise<Event> {
    const event = this.eventRepository.create({
      type,
      user,
      cv,
      details,
    });
    return this.eventRepository.save(event);
  }

  async findAllByUser(userId: number): Promise<Event[]> {
    return this.eventRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
    });
  }

  async findAllByCv(cvId: number): Promise<Event[]> {
    return this.eventRepository.find({
      where: { cv: { id: cvId } },
      order: { timestamp: 'DESC' },
    });
  }
}
