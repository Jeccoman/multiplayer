import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly gameService: GameService) {
    this.gameService.setServer(this.server);
  }

  handleConnection(client: Socket) {
    this.gameService.addPlayer(client);
    this.broadcastPlayerUpdate();
  }

  handleDisconnect(client: Socket) {
    this.gameService.removePlayer(client.id);
    this.broadcastPlayerUpdate();
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() username: string, client: Socket) {
    this.gameService.setPlayerUsername(client.id, username);
    this.broadcastPlayerUpdate();
    this.gameService.checkGameStart();
  }

  private broadcastPlayerUpdate() {
    this.server.emit('player_update', this.gameService.getPlayers());
  }
}