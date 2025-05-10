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
import { CreateMessageDto } from 'src/messages/dtos/message.dto';

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
}
