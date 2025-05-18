import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly gameService: GameService) {
    // Ensure server is set after initialization
    this.gameService.setServer(this.server);
  }

  afterInit(server: Server) {
    // Set server instance after gateway initialization
    this.gameService.setServer(server);
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
  handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket) {
    console.log(`Client joining with ID: ${client.id}, Username: ${username}`);
    this.gameService.setPlayerUsername(client.id, username);
    this.broadcastPlayerUpdate();
    this.gameService.checkGameStart();
  }

  @SubscribeMessage('reset_game')
  handleResetGame(@ConnectedSocket() client: Socket) {
    console.log(`Reset game requested by client: ${client.id}`);
    this.gameService.resetGame();
    this.broadcastPlayerUpdate();
  }

  private broadcastPlayerUpdate() {
    if (this.server) {
      this.server.emit('player_update', this.gameService.getPlayers());
    } else {
      console.error('Server instance not available for broadcast');
    }
  }
}