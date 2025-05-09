import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Reaction } from './reaction.entity';
import { Reply } from './reply.entity';
import { ChatRoom } from './chatroom.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.sentMessages)
  author: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, { nullable: true })
  receiver: User;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { nullable: true })
  room: ChatRoom;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions: Reaction[];

  @OneToMany(() => Reply, (reply) => reply.message)
  replies: Reply[];

  @ManyToOne(() => Message, (message) => message.thread, { nullable: true })
  parentMessage: Message;

  @OneToMany(() => Message, (message) => message.parentMessage)
  thread: Message[];

  @Column({ default: false })
  isEdited: boolean;

  @Column({ nullable: true })
  deletedAt: Date;
}
