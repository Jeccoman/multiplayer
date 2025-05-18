import { GameProvider } from './context/GameContext';
import JoinGame from './components/JoinGame';
import PlayerList from './components/PlayerList';
import GameStatus from './components/GameStatus';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
            Multi-Round Points Game
          </h1>
          <JoinGame />
          <GameStatus />
          <PlayerList />
        </div>
      </div>
    </GameProvider>
  );
}

export default App;