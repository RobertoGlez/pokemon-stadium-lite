import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LobbyProvider } from './core/context/LobbyContext';
import { LoginScreen } from './features/lobby/components/LoginScreen';
import { LobbyRoom } from './features/lobby/components/LobbyRoom';
import { BattleArena } from './features/battle/components/BattleArena';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LobbyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/lobby" element={<LobbyRoom />} />
            <Route path="/battle" element={<BattleArena />} />
          </Routes>
        </BrowserRouter>
      </LobbyProvider>
    </div>
  );
}

export default App;
