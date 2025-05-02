// src/history/history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';
import { ActionTypeEnum } from './enum/action-type.enum';
import { User } from '@ngneat/falso';
import { UserService } from 'src/user/user.service';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepo: Repository<History>,
    private userService : UserService
  ) {}

  async log(entityId: number, action: ActionTypeEnum, performedById: number) {

    const history = this.historyRepo.create({ entityId,actionType:action});
    const user =await this.userService.findOne(performedById)
    if(!user){
        throw new NotFoundException
    }
    history.performedBy=user
    await this.historyRepo.save(history);
  }
}
