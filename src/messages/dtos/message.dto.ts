import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ReactionType } from '../enums/reaction.enum';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  receiverId?: number;

  @IsNumber()
  @IsOptional()
  roomId?: number;

  @IsNumber()
  @IsOptional()
  parentMessageId?: number;
}
export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isEdited?: boolean;
}
export class MessageReactionDto {
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  reactionType: ReactionType;
}

export class MessageResponseDto {
  id: number;
  content: string;
  authorId: number;
  receiverId?: number;
  roomId?: number;
  parentMessageId?: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  reactions: ReactionResponseDto[];
  replies: ReplyResponseDto[];
}
export class ReplyResponseDto {
  id: number;
  content: string;
  userId: number;
  messageId: number;
  createdAt: Date;
}

export class ReactionResponseDto {
  id: number;
  type: ReactionType;
  userId: number;
  createdAt: Date;
}
