import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable()
  members: User[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}
