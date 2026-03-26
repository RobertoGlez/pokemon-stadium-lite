import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LobbyProvider } from './core/context/LobbyContext';
import { LoginScreen } from './features/lobby/components/LoginScreen';
import { LobbyRoom } from './features/lobby/components/LobbyRoom';
import { BattleArena } from './features/battle/components/BattleArena';
import { VictoryScreen } from './features/battle/components/VictoryScreen';
import { LanguageSwitcher } from './shared/components/LanguageSwitcher';

function App() {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    document.title = t('appName');
    document.documentElement.lang = i18n.language;
  }, [t, i18n.language]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LanguageSwitcher variant="floating" />
      <LobbyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/lobby" element={<LobbyRoom />} />
            <Route path="/battle" element={<BattleArena />} />
            <Route path="/results" element={<VictoryScreen />} />
          </Routes>
        </BrowserRouter>
      </LobbyProvider>
    </div>
  );
}

export default App;
