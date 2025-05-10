import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { SessionService } from './session/session.service';
import { SendMessageToRoomArgs } from './interfaces/socket.interface';
import { CreateMessageDto } from 'src/messages/dtos/message.dto';
import { MessageService } from 'src/messages/services/message.service';

@Injectable()
export class SocketService {
  private server: Server;

  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    try {
      const user = this.sessionService.authenticate(client);
      client.data.user = {
        id: user.id,
        username: user.username,
      };
      this.sessionService.registerSocket(client.id, user.id);
      return user;
    } catch (error) {
      client.emit('auth-error', { message: error.message });
      client.disconnect();
      return null;
    }
  }

  handleDisconnection(client: Socket) {
    const userId = this.sessionService.getUserId(client.id);
    if (userId) {
      this.sessionService.removeSocket(client.id);
    }
  }

  sendToRoom({ client, room, message, event }: SendMessageToRoomArgs) {
    client.to(room).emit(event, message);
  }
  getUser(client: Socket) {
    const userId = this.sessionService.getUserId(client.id);
    if (userId) {
      const user = this.userService.findOne(userId);
      return user;
    }
    return null;
  }
  async sendMessage(client: Socket, sender: number, args: CreateMessageDto) {
    const message = await this.messageService.createMessage(sender, {
      ...args,
    });

    if (message.room) {
      this.server.to(`room-${message.room.id}`).emit('new-message', message);
    } else if (message.receiver) {
      const receiverSockets = this.sessionService.getUserSockets(
        message.receiver.id,
      );
      receiverSockets.forEach((socketId) => {
        this.server.to(socketId).emit('private-message', message);
      });
      const senderSockets = this.sessionService.getUserSockets(sender);
      senderSockets.forEach((socketId) => {
        if (socketId !== client.id) {
          this.server.to(socketId).emit('private-message', message);
        }
      });
    }
  }
}
