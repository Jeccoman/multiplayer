import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import Spinner from './Spinner';

const PlayerList = () => {
  const gameContext = useContext(GameContext);
  if (!gameContext) return null;

  const { players, spinning, currentUserId } = gameContext.gameState;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-center mb-2">Players</h2>
      <ul className="list-none p-0 space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className={`my-2 flex items-center justify-center ${
              player.id === currentUserId ? 'font-bold text-blue-600' : ''
            }`}
          >
            <span>
              {player.username}
              {player.id === currentUserId && ' (You)'}
            </span>
            <span className="ml-2">(Score: {player.score})</span>
            {spinning && <Spinner />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;