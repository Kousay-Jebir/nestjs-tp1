import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Reply {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, (message) => message.replies)
  message: Message;

  @ManyToOne(() => User, (user) => user.replies)
  user: User;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
