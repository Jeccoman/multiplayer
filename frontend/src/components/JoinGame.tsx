import { useState, useContext } from 'react';
import { GameContext } from '../context/GameContext';

const JoinGame = () => {
  const [username, setUsername] = useState('');
  const gameContext = useContext(GameContext);

  const handleJoin = () => {
    if (username.trim() && gameContext) {
      gameContext.joinGame(username);
      setUsername(''); // Clear input after joining
    }
  };

  return (
    <div className="my-6 text-center">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        className="p-2 border rounded-lg w-1/3 mr-2 text-center"
      />
      <button
        onClick={handleJoin}
        disabled={!username.trim()}
        className="p-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition duration-200"
      >
        Join Game
      </button>
    </div>
  );
};

export default JoinGame;