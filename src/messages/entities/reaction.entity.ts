import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { ReactionType } from '../enums/reaction.enum';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: ReactionType;

  @ManyToOne(() => User, (user) => user.reactions)
  user: User;

  @ManyToOne(() => Message, (message) => message.reactions)
  message: Message;

  @CreateDateColumn()
  createdAt: Date;
}
