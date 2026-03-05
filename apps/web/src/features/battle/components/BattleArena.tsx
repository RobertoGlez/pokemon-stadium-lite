import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../../core/context/LobbyContext';
import { HealthBar } from '../../../shared/components/pokemon/HealthBar';

export function BattleArena() {
    const navigate = useNavigate();
    const { isConnected, lobbyStatus, currentTurnPlayerId, players, localNickname, emitAttack, lastDamageEvent } = useLobby();

    // Local ephemeral states for real-time CSS animations
    const [animateDamageFor, setAnimateDamageFor] = useState<'ally' | 'opponent' | null>(null);

    // Route Guard
    useEffect(() => {
        if (!isConnected || (lobbyStatus !== 'battling' && lobbyStatus !== 'finished')) {
            navigate('/lobby');
        }
    }, [isConnected, lobbyStatus, navigate]);

    // Listen to damage events sequentially to drop "pop-ups"
    useEffect(() => {
        if (!lastDamageEvent) return;

        const localPlayer = players.find(p => p.nickname === localNickname);
        const isAllyHit = lastDamageEvent.defenderId === localPlayer?.id;

        setAnimateDamageFor(isAllyHit ? 'ally' : 'opponent');

        const timer = setTimeout(() => {
            setAnimateDamageFor(null);
        }, 800);

        return () => clearTimeout(timer);
    }, [lastDamageEvent, players, localNickname]);

    if (!isConnected || (lobbyStatus !== 'battling' && lobbyStatus !== 'finished')) return null;

    const localPlayer = players.find(p => p.nickname === localNickname);
    const opponent = players.find(p => p.nickname !== localNickname);

    const isMyTurn = currentTurnPlayerId === localPlayer?.id;
    const myTeamAllDead = localPlayer?.team?.every(p => p.isDefeated) ?? true;

    // Evaluate active pokemons
    const activeAlly = localPlayer?.team?.find(p => !p.isDefeated);
    const activeOpponent = opponent?.team?.find(p => !p.isDefeated);

    const allyDamageClasses = animateDamageFor === 'ally'
        ? "brightness-150 sepia hue-rotate-[-50deg] saturate-[3] drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
        : "drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]";

    const opponentDamageClasses = animateDamageFor === 'opponent'
        ? "brightness-150 sepia hue-rotate-[-50deg] saturate-[3] drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-x-[-1]"
        : "drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-x-[-1]";

    return (
        <div className="relative flex flex-col items-center justify-between min-h-screen p-8 bg-background text-foreground dark overflow-hidden selection:bg-none">

            {/* Header Status */}
            <div className="text-center mt-4">
                <h2 className="text-3xl font-black tracking-tighter text-primary/80">
                    ESTADIO DE BATALLA
                </h2>
                <div className="mt-2 text-sm uppercase tracking-widest font-bold border border-border bg-card px-6 py-2 rounded-full inline-block">
                    {isMyTurn ? (
                        <span className="text-green-500 animate-pulse">Tu Turno</span>
                    ) : (
                        <span className="text-orange-500">Esperando al Oponente...</span>
                    )}
                </div>
            </div>

            {/* Combat Field */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-16 md:gap-8 my-10">

                {/* Local Player (Ally) */}
                <div className="flex flex-col items-center w-full md:w-1/2">
                    <h3 className="text-xl font-bold mb-6 text-blue-400">{localNickname}</h3>
                    {activeAlly ? (
                        <div className="relative group flex flex-col items-center">
                            <HealthBar currentHp={activeAlly.stats.currentHp} maxHp={activeAlly.stats.maxHp} />
                            <div className="h-48 w-48 mt-8 relative flex justify-center items-center">
                                {/* Floating Damage Text */}
                                {animateDamageFor === 'ally' && (
                                    <div className="absolute top-0 text-red-500 font-black text-4xl animate-bounce drop-shadow-md z-10 pointer-events-none">
                                        -{lastDamageEvent?.damage} HP
                                    </div>
                                )}
                                <img
                                    src={activeAlly.spriteUrl}
                                    alt={activeAlly.name}
                                    className={`w-full h-full object-contain filter select-none transition-all duration-150 ${allyDamageClasses}`}
                                />
                            </div>
                            <span className="mt-4 font-bold text-lg uppercase tracking-wide">{activeAlly.name}</span>
                        </div>
                    ) : (
                        <span className="text-red-500 font-bold opacity-50 h-48 flex items-center">EQUIPO DERROTADO</span>
                    )}
                </div>

                <div className="hidden md:flex flex-col items-center justify-center opacity-30 px-8">
                    <span className="text-4xl font-black italic">VS</span>
                </div>

                {/* Opponent Player */}
                <div className="flex flex-col items-center w-full md:w-1/2">
                    <h3 className="text-xl font-bold mb-6 text-red-400">{opponent?.nickname || 'Rival'}</h3>
                    {activeOpponent ? (
                        <div className="relative group flex flex-col items-center">
                            <HealthBar currentHp={activeOpponent.stats.currentHp} maxHp={activeOpponent.stats.maxHp} />
                            <div className="h-48 w-48 mt-8 relative flex justify-center items-center">
                                {/* Floating Damage Text */}
                                {animateDamageFor === 'opponent' && (
                                    <div className="absolute top-0 text-red-500 font-black text-4xl animate-bounce drop-shadow-md z-10 pointer-events-none">
                                        -{lastDamageEvent?.damage} HP
                                    </div>
                                )}
                                <img
                                    src={activeOpponent.spriteUrl}
                                    alt={activeOpponent.name}
                                    className={`w-full h-full object-contain filter select-none transition-all duration-150 ${opponentDamageClasses}`}
                                />
                            </div>
                            <span className="mt-4 font-bold text-lg uppercase tracking-wide">{activeOpponent.name}</span>
                        </div>
                    ) : (
                        <span className="text-red-500 font-bold opacity-50 h-48 flex items-center">EQUIPO DERROTADO</span>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="mb-12">
                <button
                    onClick={emitAttack}
                    disabled={!isMyTurn || !activeAlly || !activeOpponent || lobbyStatus === 'finished'}
                    className={`relative overflow-hidden w-64 h-16 rounded-xl font-black tracking-widest text-lg transition-all duration-300 ease-out 
                        ${(isMyTurn && lobbyStatus !== 'finished')
                            ? 'bg-primary text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] cursor-pointer'
                            : 'bg-card text-muted-foreground border border-muted-foreground opacity-50 cursor-not-allowed'
                        }`}
                >
                    ATACAR
                </button>
            </div>

            {/* Victory/Defeat Modal */}
            {lobbyStatus === 'finished' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                    <h1 className={`text-7xl font-black uppercase tracking-widest mb-6 ${myTeamAllDead ? 'text-red-500' : 'text-green-500'}`}>
                        {myTeamAllDead ? 'DERROTA' : '¡VICTORIA!'}
                    </h1>
                    <button onClick={() => navigate('/lobby')} className="px-8 py-3 bg-primary text-white hover:bg-primary/80 rounded-xl font-bold transition-all hover:scale-105">
                        VOLVER AL LOBBY
                    </button>
                </div>
            )}

        </div>
    );
}
