import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
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
import { ReactionType } from '../enums/reaction.enum';
import { PaginationDto } from 'src/services/pagination.dto';

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

    let receiver: User | null = null;
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

    let room: ChatRoom | null = null;
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

    let parentMessage: Message | null = null;
    if (createMessageDto.parentMessageId) {
      parentMessage = await this.findOne(createMessageDto.parentMessageId);
      if (!parentMessage) {
        throw new NotFoundException(
          `Parent message with ID ${createMessageDto.parentMessageId} not found`,
        );
      }
    }

    const messageData: DeepPartial<Message> = {
      content: createMessageDto.content,
      author,
      receiver: receiver || undefined,
      room: room || undefined,
      parentMessage: parentMessage || undefined,
    };

    const message = this.messageRepository.create(messageData);
    return this.messageRepository.save(message);
  }
  async addReaction(
    messageId: number,
    userId: number,
    reactionType: ReactionType,
  ): Promise<Reaction> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['reactions'],
    });
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const existingReaction = await this.reactionRepository.findOne({
      where: {
        message: { id: messageId },
        user: { id: userId },
        type: reactionType,
      },
    });

    if (existingReaction) {
      throw new BadRequestException('Reaction already exists');
    }

    const reaction = this.reactionRepository.create({
      type: reactionType,
      user,
      message,
    });

    return this.reactionRepository.save(reaction);
  }
  async removeReaction(
    messageId: number,
    userId: number,
    reactionType: ReactionType,
  ): Promise<void> {
    const reaction = await this.reactionRepository.findOne({
      where: {
        message: { id: messageId },
        user: { id: userId },
        type: reactionType,
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.reactionRepository.remove(reaction);
  }
  async addReply(
    messageId: number,
    userId: number,
    content: string,
  ): Promise<Reply> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const reply = this.replyRepository.create({
      content,
      user,
      message,
    });

    return this.replyRepository.save(reply);
  }
  async getRoomMessages(
    roomId: number,
    userId: number,
    pagination?: PaginationDto,
  ): Promise<Message[]> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });

    if (!room) {
      throw new NotFoundException(`Chat room with ID ${roomId} not found`);
    }

    if (!room.members.some((member) => member.id === userId)) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('reactions.user', 'reactionUser')
      .leftJoinAndSelect('message.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .where('message.room.id = :roomId', { roomId })
      .andWhere('message.deletedAt IS NULL')
      .orderBy('message.createdAt', 'DESC');

    if (pagination?.limit) {
      query.take(pagination.limit);
    }
    if (pagination?.offset) {
      query.skip(pagination.offset);
    }

    return query.getMany();
  }
  async softDelete(id: number): Promise<void> {
    await this.messageRepository.update(id, {
      deletedAt: new Date(),
    });
  }
  async createRoom(creatorId: number, name: string) {
    const creator = await this.userRepository.findOne({
      where: { id: creatorId },
    });
    if (!creator) {
      throw new NotFoundException(`User with ID ${creatorId} not found`);
    }

    const members: User[] = [creator];
    const room = this.roomRepository.create({ name, members });

    return this.roomRepository.save(room);
  }
  async addMembersToRoom(
    roomId: number,
    requesterId: number,
    MemberId: number,
  ) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });
    if (!room) {
      throw new NotFoundException(`Chat room with ID ${roomId} not found`);
    }

    const isRequesterMember = room.members.some(
      (member) => member.id === requesterId,
    );
    if (!isRequesterMember) {
      throw new ForbiddenException(
        'You must be a member of the room to add others',
      );
    }

    const newMember = await this.userRepository.findOne({
      where: { id: MemberId },
    });

    if (!newMember)
      throw new NotFoundException(`User with ID${MemberId} not found`);

    const existingMemberId = room.members.filter(
      (member) => member.id === MemberId,
    );

    if (existingMemberId.length > 0) {
      throw new BadRequestException(`User already members of this room`);
    }

    room.members = [...room.members, newMember];
    return this.roomRepository.save(room);
  }
  async getUserRooms(userId: number): Promise<ChatRoom[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.roomRepository.find({
      where: {
        members: { id: userId },
      },
      relations: ['members'],
    });
  }
}
