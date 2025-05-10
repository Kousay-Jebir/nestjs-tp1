import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistoryService } from './history.service';
import { EntityType } from './enum/entity-type.enum';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get('entity/:type/:id')
    getEntityHistory(
        @Param('type') type: EntityType,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.historyService.getHistoryByEntity(type, id);
    }
    @Get('user/:userId')
    getUserHistory(@Param('userId', ParseIntPipe) userId: number) {
        return this.historyService.getHistoryByUser(userId);
    }
}
