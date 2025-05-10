import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';
import { Role } from '../enums/role.enum';
import { Message } from 'src/messages/entities/message.entity';
import { Reaction } from 'src/messages/entities/reaction.entity';
import { Reply } from 'src/messages/entities/reply.entity';
import { ChatRoom } from 'src/messages/entities/chatroom.entity';
import { History } from 'src/history/entities/history.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Cv, (cv) => cv.user)
  cvs: Cv[];

  @OneToMany(() => Message, (message) => message.author)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Reply, (reply) => reply.user)
  replies: Reply[];

  @ManyToMany(() => ChatRoom, (room) => room.members)
  rooms: ChatRoom[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];
  @OneToMany(() => History, h => h.performedBy) histories: History[];
}
