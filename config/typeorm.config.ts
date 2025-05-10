import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';
import { Cv } from '../src/cv/entities/cv.entity';
import { User } from '../src/user/entities/user.entity';
import { Skill } from '../src/skill/entities/skill.entity';
import { Message } from '../src/messages/entities/message.entity';
import { ChatRoom } from '../src/messages/entities/chatroom.entity';
import { Reaction } from '../src/messages/entities/reaction.entity';
import { Reply } from '../src/messages/entities/reply.entity';

export default registerAs(
  'typeorm',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Cv, User, Skill, Message, ChatRoom, Reaction, Reply],
    synchronize: true,
  }),
);
