import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class GameService {
  private players: Map<string, { username: string; score: number }> = new Map();
  private minPlayers = 4;
  private totalRounds = 5;
  private currentRound = 0;
  private gameStarted = false;
  private server: Server;

  constructor() {
    this.resetGame();
    console.log('GameService initialized with clean state');
  }

  setServer(server: Server) {
    this.server = server;
    console.log('Server instance set in GameService');
  }

  addPlayer(client: Socket) {
    this.players.set(client.id, { username: `Player_${client.id.slice(0, 4)}`, score: 0 });
    console.log(`Player added: ${client.id}, Total players: ${this.players.size}`);
  }

  removePlayer(clientId: string) {
    this.players.delete(clientId);
    console.log(`Player removed: ${clientId}, Total players: ${this.players.size}`);
  }

  setPlayerUsername(clientId: string, username: string) {
    const player = this.players.get(clientId);
    if (!player) {
      console.error(`Player with ID ${clientId} not found`);
      return;
    }
    this.players.set(clientId, { ...player, username });
    console.log(`Username set for ${clientId}: ${username}`);
  }

  getPlayers() {
    return Array.from(this.players.entries()).map(([id, { username, score }]) => ({
      id,
      username,
      score,
    }));
  }

  checkGameStart() {
    console.log(`Checking game start: players=${this.players.size}, gameStarted=${this.gameStarted}`);
    if (!this.gameStarted && this.players.size >= this.minPlayers) {
      this.startGame();
    } else if (this.players.size < this.minPlayers) {
      console.log(`Not enough players to start (need ${this.minPlayers}, have ${this.players.size})`);
    } else if (this.gameStarted) {
      console.log('Game already started, waiting for next round or reset');
    }
  }

  private startGame() {
    console.log('Starting game...');
    this.gameStarted = true;
    this.currentRound = 1;
    this.emit('game_start', { totalRounds: this.totalRounds });
    this.startRound();
  }

  private startRound() {
    console.log(`Starting round ${this.currentRound}`);
    this.emit('new_round', { round: this.currentRound, totalRounds: this.totalRounds });
    setTimeout(() => this.endRound(), 3000);
  }

  private endRound() {
    const players = this.getPlayers();
    if (players.length === 0) {
      console.log('No players available for round end');
      return;
    }
    const winner = players[Math.floor(Math.random() * players.length)];
    this.players.set(winner.id, {
      username: winner.username,
      score: winner.score + 1,
    });

    console.log(`Round ${this.currentRound} winner: ${winner.username}, New score: ${winner.score + 1}`);

    this.emit('round_result', {
      winner: winner.username,
      scores: this.getPlayers(),
    });

    if (this.currentRound < this.totalRounds) {
      this.currentRound++;
      this.startRound();
    } else {
      this.endGame();
    }
  }

  private endGame() {
    const players = this.getPlayers();
    if (players.length === 0) {
      console.log('No players available for game end');
      return;
    }
    const maxScore = Math.max(...players.map((p) => p.score));
    const winners = players.filter((p) => p.score === maxScore).map((p) => p.username);
    console.log(`Game over! Winner(s): ${winners.join(', ')}`);
    this.emit('game_over', { scores: players, winners });
    this.resetGame();
  }

  public resetGame() { // Changed from private to public
    console.log('Resetting game state...');
    this.gameStarted = false;
    this.currentRound = 0;
    this.players.forEach((player, id) => {
      this.players.set(id, { ...player, score: 0 });
    });
  }

  private emit(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
      console.log(`Emitted event: ${event}`, data);
    } else {
      console.error('Server instance not set for emitting events');
    }
  }
}