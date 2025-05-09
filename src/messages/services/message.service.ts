import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SharedService } from 'src/services/shared.service';
import { DeepPartial, Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dtos/message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from '../entities/reaction.entity';
import { Reply } from '../entities/reply.entity';

import { ChatRoom } from '../entities/chatroom.entity';

import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MessageService extends SharedService<Message> {
  constructor(
    @InjectRepository(Message)
    protected readonly messageRepository: Repository<Message>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatRoom)
    private readonly roomRepository: Repository<ChatRoom>,
  ) {
    super(messageRepository);
  }

  async createMessage(
    authorId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    if (createMessageDto.receiverId && createMessageDto.roomId) {
      throw new BadRequestException(
        'Message cannot have both receiver and room',
      );
    }
    if (!createMessageDto.receiverId && !createMessageDto.roomId) {
      throw new BadRequestException(
        'Message must have either receiver or room',
      );
    }

    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });
    if (!author) {
      throw new NotFoundException(`User with ID ${authorId} not found`);
    }

    let receiver: any = null;
    if (createMessageDto.receiverId) {
      receiver = await this.userRepository.findOne({
        where: { id: createMessageDto.receiverId },
      });
      if (!receiver) {
        throw new NotFoundException(
          `Receiver with ID ${createMessageDto.receiverId} not found`,
        );
      }
    }

    let room: any = null;
    if (createMessageDto.roomId) {
      room = await this.roomRepository.findOne({
        where: { id: createMessageDto.roomId },
        relations: ['members'],
      });
      if (!room) {
        throw new NotFoundException(
          `Chat room with ID ${createMessageDto.roomId} not found`,
        );
      }
      if (!room.members.some((member) => member.id === author.id)) {
        throw new BadRequestException('Author is not a member of this room');
      }
    }

    let parentMessage: any = null;
    if (createMessageDto.parentMessageId) {
      parentMessage = await this.findOne(createMessageDto.parentMessageId);
      if (!parentMessage) {
        throw new NotFoundException(
          `Parent message with ID ${createMessageDto.parentMessageId} not found`,
        );
      }
      if (room && parentMessage.room?.id !== room.id) {
        throw new BadRequestException(
          'Parent message not found in specified room',
        );
      }
    }

    const messageData: DeepPartial<Message> = {
      content: createMessageDto.content,
      author,
      receiver,
      room,
      parentMessage,
    };

    const message = this.messageRepository.create(messageData);
    return this.messageRepository.save(message);
  }
}
