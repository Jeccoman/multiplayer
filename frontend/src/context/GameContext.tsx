import { createContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  username: string;
  score: number;
}

interface GameState {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  status: string;
  winner: string | null;
  gameOver: boolean;
  spinning: boolean;
  currentUserId: string | null;
}

interface GameContextType {
  gameState: GameState;
  joinGame: (username: string) => void;
  socket: Socket | null;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 0,
    totalRounds: 0,
    status: 'Waiting for players...',
    winner: null,
    gameOver: false,
    spinning: false,
    currentUserId: null,
  });

  useEffect(() => {
    const connectSocket = () => {
      const newSocket = io('http://localhost:3000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('WebSocket connected:', newSocket.id);
        setGameState((prev) => ({ ...prev, currentUserId: newSocket.id }));
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      newSocket.on('player_update', (players: Player[]) => {
        console.log('Received player_update:', players);
        setGameState((prev) => ({
          ...prev,
          players,
          gameOver: false,
          status: prev.gameOver ? 'Waiting for players...' : prev.status,
        }));
      });

      newSocket.on('game_start', ({ totalRounds }) => {
        console.log('Received game_start:', totalRounds);
        setGameState((prev) => ({
          ...prev,
          totalRounds,
          currentRound: 0,
          spinning: false,
          gameOver: false,
          status: 'Game starting...',
        }));
      });

      newSocket.on('new_round', ({ round, totalRounds }) => {
        console.log('Received new_round:', round, totalRounds);
        setGameState((prev) => ({
          ...prev,
          currentRound: round,
          totalRounds,
          spinning: true,
          status: `Round ${round} of ${totalRounds}: All players spinning!`,
        }));
      });

      newSocket.on('round_result', ({ winner, scores }) => {
        console.log('Received round_result:', winner, scores);
        setGameState((prev) => ({
          ...prev,
          players: scores,
          spinning: false,
          winner,
          status: `Round ${prev.currentRound} Winner: ${winner}!`,
        }));
      });

      newSocket.on('game_over', ({ scores, winners }) => {
        console.log('Received game_over:', scores, winners);
        setGameState((prev) => ({
          ...prev,
          players: scores,
          gameOver: true,
          status: `Game Over! Winner(s): ${winners.join(', ')}`,
        }));
      });

      return newSocket;
    };

    const socket = connectSocket();

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinGame = (username: string) => {
    if (socket) {
      socket.emit('join', username);
    }
  };

  return (
    <GameContext.Provider value={{ gameState, joinGame, socket }}>
      {children}
    </GameContext.Provider>
  );
};