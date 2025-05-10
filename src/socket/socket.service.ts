import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { SessionService } from './session/session.service';
import { SendMessageToRoomArgs } from './interfaces/socket.interface';
import { CreateMessageDto } from 'src/messages/dtos/message.dto';
import { MessageService } from 'src/messages/services/message.service';
import { ReactionType } from 'src/messages/enums/reaction.enum';
import { WsException } from '@nestjs/websockets';

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
      const rooms = await this.messageService.getUserRooms(user.id);
      rooms.map((team) => {
        this.joinRoom(client, `room_${team.id}`, {
          message: `${user.username} is connected`,
          userId: user.id,
        });
      });

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
    const message = await this.messageService.createMessage(sender, args);
    console.log(message);
    if (message.room) {
      this.server.to(`room_${message.room.id}`).emit('room-message', message);
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
  joinRoom(client: Socket, room: string, data?: any) {
    client.join(room);
    client.to(room).emit('member-connected', data);
  }
  async reactToMessage(
    client: Socket,
    messageId: number,
    reactionType: ReactionType,
  ) {
    try {
      const userId = client.data.user.id;
      const reaction = await this.messageService.addReaction(
        messageId,
        userId,
        reactionType,
      );

      const message = await this.messageService.findOne(messageId);

      if (!message) {
        throw new WsException('message not found');
      }

      if (message.author.id !== userId) {
        this.notifyUser(message.author.id, 'reaction-notification', {
          type: 'REACTION',
          message: `Someone reacted with ${reactionType} to your message`,
          reactionType,
          messageId,
          userId,
        });
      }
      if (message.room) {
        this.server.to(`room_${message.room.id}`).emit('message-reaction', {
          messageId,
          reaction,
          userId,
        });
      } else if (message.receiver) {
        const participants = [message.author.id, message.receiver.id];
        participants.forEach((participantId) => {
          this.server.to(`user_${participantId}`).emit('message-reaction', {
            messageId,
            reaction,
            userId,
          });
        });
      }

      return reaction;
    } catch (error) {
      client.emit('reaction-error', { message: error.message });
    }
  }
  async replyToMessage(client: Socket, messageId: number, content: string) {
    try {
      const userId = client.data.user.id;
      const reply = await this.messageService.addReply(
        messageId,
        userId,
        content,
      );

      const message = await this.messageService.findOne(messageId);

      if (!message) {
        throw new WsException('Message not found');
      }

      if (message.author.id !== userId) {
        this.notifyUser(message.author.id, 'reply-notification', {
          type: 'REPLY',
          message: `Someone replied to your message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          messageId,
          replyId: reply.id,
          userId,
        });
      }

      if (message.room) {
        this.server.to(`room_${message.room.id}`).emit('message-reply', {
          messageId,
          reply,
          userId,
        });
      } else if (message.receiver) {
        const participants = [message.author.id, message.receiver.id];
        participants.forEach((participantId) => {
          this.server.to(`user_${participantId}`).emit('message-reply', {
            messageId,
            reply,
            userId,
          });
        });
      }

      return reply;
    } catch (error) {
      client.emit('reply-error', { message: error.message });
      throw error;
    }
  }
  private notifyUser(userId: number, event: string, data: any) {
    const sockets = this.sessionService.getUserSockets(userId);
    sockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }
}
