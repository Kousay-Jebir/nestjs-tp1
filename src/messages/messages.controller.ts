import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './services/message.service';
import { plainToInstance } from 'class-transformer';
import { ReactionType } from './enums/reaction.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ConnectedUser } from 'src/auth/decorators/user.decorator';
import {
  CreateMessageDto,
  MessageReactionDto,
  MessageResponseDto,
} from './dtos/message.dto';
import { Message } from './entities/message.entity';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(
    @ConnectedUser() connectedUser,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.messageService.createMessage(
      connectedUser.id,
      createMessageDto,
    );
    return this.toMessageDto(message);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {}

  async remove(@Param('id') id: string): Promise<void> {
    await this.messageService.delete(+id);
  }

  @Post(':id/reactions')
  async addReaction(
    @Param('id') messageId: string,
    @Body() reactionDto: MessageReactionDto,
  ): Promise<void> {}

  @Delete(':id/reactions/:userId/:reactionType')
  async removeReaction(
    @Param('id') messageId: string,
    @Param('userId') userId: string,
    @Param('reactionType') reactionType: ReactionType,
  ): Promise<void> {}

  @Post(':id/replies')
  async createReply(
    @Param('id') messageId: string,
    @Body('userId') userId: number,
    @Body('content') content: string,
  ) {}

  @Get('room/:roomId')
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {}

  private toMessageDto(message: Message): MessageResponseDto {
    return plainToInstance(MessageResponseDto, {
      ...message,
      authorId: message.author?.id,
      receiverId: message.receiver?.id,
      roomId: message.room?.id,
      parentMessageId: message.parentMessage?.id,
      reactions: message.reactions?.map((reaction) => ({
        id: reaction.id,
        type: reaction.type,
        userId: reaction.user?.id,
        createdAt: reaction.createdAt,
      })),
      replies: message.replies?.map((reply) => ({
        id: reply.id,
        content: reply.content,
        userId: reply.user?.id,
        messageId: reply.message?.id,
        createdAt: reply.createdAt,
      })),
    });
  }
}
