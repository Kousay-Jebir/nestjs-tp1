import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { HistoryListener } from './history.listener';

@Module({
  imports: [TypeOrmModule.forFeature([History])],
  providers: [HistoryService, HistoryListener],
  exports: [HistoryService]
})
export class HistoryModule { }
