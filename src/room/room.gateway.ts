import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dtos/joinroom.dto';
import { UpdateUserPositionDto } from './dtos/updateposition.dto';
import { ToglMuteDto } from './dtos/toglMute.dto';
import { inRoom } from './dtos/inRoom.dto';
import { ToglViewDto } from './dtos/toglView.dto';

type ActiveSocketType = {
  room: String;
  id: string;
  userId: string;
}

@WebSocketGateway({ cors: true })
export class RoomGateway implements OnGatewayInit, OnGatewayDisconnect {

  constructor(private readonly service: RoomService) { }

  @WebSocketServer() wss: Server;

  private logger = new Logger(RoomGateway.name);
  private activeSockets: ActiveSocketType[] = [];

  async handleDisconnect(client: any) {
    const existingOnSocket = this.activeSockets.find(
      socket => socket.id === client.id
    );

    if (!existingOnSocket) return;

    this.activeSockets = this.activeSockets.filter(
      socket => socket.id !== client.id
    );

    const dto = {
      link: existingOnSocket.room,
      userId: existingOnSocket.userId,
      inRoom: false
    } as inRoom;
    await this.service.deleteUsersPosition(client.id, dto);

    client.broadcast.emit(`${existingOnSocket.room}-remove-user`, { socketId: client.id });

    this.logger.debug(`Client: ${client.id} disconnected`);
  }

  afterInit(server: any) {
    this.logger.log('Gateway initialized');
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, payload: JoinRoomDto) {
    const { link, userId } = payload;

    const existingOnSocket = this.activeSockets.find(
      socket => socket.room === link && socket.id === client.id);

    if (!existingOnSocket) {
      this.activeSockets.push({ room: link, id: client.id, userId });

      // Verifica se o usuário já tem uma posição anterior na sala
      const previousPosition = await this.service.findPreviousUserPosition(
        link,
        userId,
      );

      let x = 1;
      let y = 1;
      if (previousPosition.length > 0) {
        // Usa a posição anterior do usuário se estiver disponível
        x = previousPosition[0].x;
        y = previousPosition[0].y;
      } else {
        // Caso contrário, gera uma nova posição aleatória
        const usersInRoom = await this.service.listUsersPositionByLink(link);
        const occupiedPositions = usersInRoom.map(user => ({ x: user.x, y: user.y }));
        while (occupiedPositions.some(pos => pos.x === x && pos.y === y)) {
          // Gera novas posições até encontrar uma posição não ocupada
          x = Math.floor(Math.random() * 8) + 1;
          y = Math.floor(Math.random() * 8) + 1;
        }
      }

      const dto = {
        link,
        userId,
        x: x,
        y: y,
        inRoom: true,
        orientation: 'front'
      } as UpdateUserPositionDto


      /*const usersInRoom = await this.service.listUsersPositionByLink(link);
      usersInRoom.map((user) => {
        if (user.x === dto.x && user.y === dto.y) {
          dto.x = Math.floor(Math.random() * 8) + 1;  // Isso impede que nossa posição extrapole a matriz 8x8 definida na regra de negócio 
          dto.y = Math.floor(Math.random() * 8) + 1;
        }
      });*/

      await this.service.updateUserPosition(client.id, dto);

    }

    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, { users });

    if (!existingOnSocket) {
      client.broadcast.emit(`${link}-add-user`, { user: client.id });
    }

    this.logger.debug(`Socket client: ${client.id} start to join room ${link}`);
  }

  @SubscribeMessage('move')
  async handleMove(client: Socket, payload: UpdateUserPositionDto) {
    const { link, userId, x, y, orientation } = payload;
    const dto = {
      link,
      userId,
      x,
      y,
      orientation
    } as UpdateUserPositionDto

    await this.service.updateUserPosition(client.id, dto);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, { users });
  }

  @SubscribeMessage('toggl-mute-user')
  async handleToglMute(_: Socket, payload: ToglMuteDto) {
    const { link } = payload;
    await this.service.updateUserMute(payload);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, { users });
  }

  @SubscribeMessage('toggl-view-user')
  async handleToglView(_: Socket, payload: ToglViewDto) {
    const { link } = payload;
    await this.service.updateUserView(payload);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, { users });
  }

  @SubscribeMessage('call-user')
  async callUser(client: Socket, data: any) {
    this.logger.debug(`callUser: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: client.id
    });
  }

  @SubscribeMessage('make-answer')
  async makeAnswer(client: Socket, data: any) {
    this.logger.debug(`makeAnswer: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('answer-made', {
      answer: data.answer,
      socket: client.id
    });
  }
}