import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';

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

  async getHistory(entityType: string, entityId: number) {
    return this.repo.find({
      where: { entityType, entityId },
      order: { timestamp: 'DESC' },
    });
  }
}
