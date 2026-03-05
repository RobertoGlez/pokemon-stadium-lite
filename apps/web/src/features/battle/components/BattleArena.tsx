import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../../core/context/LobbyContext';

export function BattleArena() {
    const navigate = useNavigate();
    const { isConnected, lobbyStatus, currentTurnPlayerId, players, localNickname } = useLobby();

    // Route Guard
    useEffect(() => {
        if (!isConnected || lobbyStatus !== 'battling') {
            navigate('/lobby');
        }
    }, [isConnected, lobbyStatus, navigate]);

    if (!isConnected || lobbyStatus !== 'battling') return null;

    const localPlayer = players.find(p => p.nickname === localNickname);
    const opponent = players.find(p => p.nickname !== localNickname);
    const isMyTurn = currentTurnPlayerId === localPlayer?.id;

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground dark">
            <h1 className="text-4xl font-bold tracking-tighter mb-8 text-primary">BATTLE ARENA</h1>

            <div className="bg-card border border-border rounded-xl p-8 shadow-2xl space-y-4 text-center">
                <p className="text-xl font-medium">
                    <span className="text-primary font-bold">{localNickname}</span> vs <span className="text-red-500 font-bold">{opponent?.nickname || 'Rival'}</span>
                </p>
                <div className="h-px bg-border w-full my-4" />
                <p className="text-lg">
                    Current Turn: {' '}
                    {isMyTurn ? (
                        <span className="text-green-500 font-bold animate-pulse">YOUR TURN</span>
                    ) : (
                        <span className="text-orange-500 font-bold">OPPONENT'S TURN</span>
                    )}
                </p>
            </div>
        </div>
    );
}
