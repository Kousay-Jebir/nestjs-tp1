import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';
import { EntityType } from './enum/entity-type.enum';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private repo: Repository<History>,
  ) { }

  async logEvent(data: Partial<History>) {
    const rec = this.repo.create(data);
    await this.repo.save(rec);
  }

  async getHistoryByEntity(entityType: EntityType, entityId: number) {
    return this.repo.find({
      where: { entityType, entityId },
      order: { timestamp: 'DESC' },
    });
  }
  async getHistoryByUser(userId: number) {
    return this.repo.find({
      where: { performedByUserId: userId },
      order: { timestamp: 'DESC' },
    });
  }

}
