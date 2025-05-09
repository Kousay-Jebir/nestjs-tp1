import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { HistoryListener } from './history.listener';
import { HistoryController } from './history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([History])],
  providers: [HistoryService, HistoryListener],
  controllers: [HistoryController],
  exports: [HistoryService]
})
export class HistoryModule { }
