import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { SessionService } from './session/session.service';
import { JwtService } from '@nestjs/jwt';
import { ChatModule } from 'src/messages/message.module';
import { UserModule } from 'src/user/user.module';
@Module({
  providers: [SocketService, SocketGateway, SessionService, JwtService],
  imports: [ChatModule, UserModule],
  exports: [SocketService],
})
export class SocketModule {}
