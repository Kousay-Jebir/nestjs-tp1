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
  NotFoundException,
  ForbiddenException,
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
  UpdateMessageDto,
} from './dtos/message.dto';
import { Message } from './entities/message.entity';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('rooms')
  async createRoom(@ConnectedUser() user, @Body('name') name: string) {
    const room = await this.messageService.createRoom(user.userId, name);
    return room;
  }

  @Post('rooms/:roomId/members')
  async addMemberToRoom(
    @Param('roomId') roomId: string,
    @ConnectedUser() user,
    @Body('memberId') memberId: number,
  ) {
    const updatedRoom = await this.messageService.addMembersToRoom(
      +roomId,
      user.userId,
      memberId,
    );
    return updatedRoom;
  }

  @Post()
  async create(
    @ConnectedUser() connectedUser,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.messageService.createMessage(
      connectedUser.userId,
      createMessageDto,
    );
    return this.toMessageDto(message);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @ConnectedUser() user) {
    const message = await this.messageService.findOne(+id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return this.toMessageDto(message);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @ConnectedUser() user,
  ) {
    const message = await this.messageService.findOne(+id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    if (message.author.id !== user.userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
    const updated = await this.messageService.update(+id, {
      ...updateMessageDto,
      isEdited: true,
    });
    return this.toMessageDto(updated);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @ConnectedUser() user) {
    const message = await this.messageService.findOne(+id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    if (message.author.id !== user.userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    await this.messageService.softDelete(+id);
    return { message: 'Message deleted successfully' };
  }

  @Post(':id/reactions')
  async addReaction(
    @Param('id') messageId: string,
    @Body() reactionDto: MessageReactionDto,
    @ConnectedUser() user,
  ) {
    return await this.messageService.addReaction(
      +messageId,
      user.userId,
      reactionDto.reactionType,
    );
  }

  @Delete(':id/reactions/:reactionType')
  async removeReaction(
    @Param('id') messageId: string,
    @Param('reactionType') reactionType: ReactionType,
    @ConnectedUser() user,
  ) {
    await this.messageService.removeReaction(
      +messageId,
      user.userId,
      reactionType,
    );
    return { message: 'Reaction removed successfully' };
  }

  @Post(':id/replies')
  async createReply(
    @Param('id') messageId: string,
    @Body('content') content: string,
    @ConnectedUser() user,
  ) {
    return await this.messageService.addReply(+messageId, user.userId, content);
  }

  @Get('room/:roomId')
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @ConnectedUser() user,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const messages = await this.messageService.getRoomMessages(
      +roomId,
      user.userId,
      { limit, offset },
    );
    return messages.map((message) => this.toMessageDto(message));
  }

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
