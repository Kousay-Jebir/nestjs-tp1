import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { UseFilters, UsePipes } from '@nestjs/common';
import { WsExceptionFilter } from './socket.filter';
import { SocketService } from './socket.service';
import { AuthenticatedSocket } from './interfaces/socket.interface';

import { WsZodPipe } from './pipes/wsZod.pipe';
import {
  CreateMessageDto,
  CreateMessageSchema,
} from './schemas/chatMessage.schema';
import { ReactionType } from 'src/messages/enums/reaction.enum';
import { ReactionDto, ReactionSchema } from './schemas/reaction.schema';
import { ReplyDto, ReplySchema } from './schemas/reply.schema';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseFilters(new WsExceptionFilter())
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly socketService: SocketService) {}

  afterInit(server: Server) {
    this.socketService.setServer(server);
  }

  handleConnection(client: Socket) {
    this.socketService.handleConnection(client);
  }

  handleDisconnect(client: Socket) {
    this.socketService.handleDisconnection(client);
  }
  @SubscribeMessage('send-message')
  @UsePipes(new WsZodPipe(CreateMessageSchema))
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.socketService.sendMessage(
      client,
      client.data.user.id,
      createMessageDto,
    );

    return { success: true, message };
  }
  @SubscribeMessage('react-to-message')
  @UsePipes(new WsZodPipe(ReactionSchema))
  async handleReactToMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReactionDto,
  ) {
    try {
      const reaction = await this.socketService.reactToMessage(
        client,
        payload.messageId,
        payload.reactionType,
      );
      return { success: true, reaction };
    } catch (error) {
      client.emit('reaction-error', { message: error.message });
      return { success: false, error: error.message };
    }
  }
  @SubscribeMessage('reply-to-message')
  @UsePipes(new WsZodPipe(ReplySchema))
  async handleReplyToMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReplyDto,
  ) {
    try {
      const reply = await this.socketService.replyToMessage(
        client,
        payload.messageId,
        payload.content,
      );
      return { success: true, reply };
    } catch (error) {
      client.emit('reply-error', { message: error.message });
      return { success: false, error: error.message };
    }
  }
}
