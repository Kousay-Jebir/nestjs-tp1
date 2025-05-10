import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: number;
      username: string;
    };
  };
}

export type SendMessageToRoomArgs = {
  client: Socket;
  room: string;
  message: any;
  event: string;
};
