import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Reaction } from './entities/reaction.entity';
import { ChatRoom } from './entities/chatroom.entity';
import { Reply } from './entities/reply.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { MessageController } from './messages.controller';
import { MessageService } from './services/message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Reaction, ChatRoom, Reply]),
    forwardRef(() => AuthModule),
    UserModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class ChatModule {}
