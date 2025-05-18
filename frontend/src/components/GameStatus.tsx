import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

const GameStatus = () => {
  const gameContext = useContext(GameContext);
  if (!gameContext) return null;

  const { currentRound, totalRounds, status, gameOver } = gameContext.gameState;

  return (
    <div className="my-6 text-center">
      <h2
        className={`text-xl font-semibold ${
          gameOver ? 'text-2xl text-green-600' : 'text-gray-800'
        }`}
      >
        {status}
      </h2>
      {!gameOver && currentRound > 0 && (
        <p className="text-lg text-gray-600 mt-2">Round {currentRound} of {totalRounds}</p>
      )}
    </div>
  );
};

export default GameStatus;