import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../../core/context/LobbyContext';
import { PokemonCard } from '../../../shared/components/pokemon/PokemonCard';
import { Trophy, RotateCcw, Crown, Skull } from 'lucide-react';

export function VictoryScreen() {
    const navigate = useNavigate();
    const { players, winnerId, localNickname, battleLog, disconnect, isConnected } = useLobby();
    const [showConfetti, setShowConfetti] = useState(false);

    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id !== winnerId);
    const isPlayerWinner = winner?.nickname === localNickname;

    // Safety guard for page refresh or direct access
    useEffect(() => {
        if (!winnerId || !isConnected) {
            navigate('/');
        }
    }, [winnerId, isConnected, navigate]);

    useEffect(() => {
        if (winnerId) {
            setShowConfetti(true);
            const timeout = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [winnerId]);

    const handlePlayAgain = () => {
        disconnect();
        navigate('/');
    };

    if (!winner || !loser) return null;

    // Count surviving pokemon
    const survivingCount = winner.team?.filter(p => !p.isDefeated).length || 0;
    // Calculate total damage dealt by winner
    const totalDamageDealt = loser.team?.reduce((acc, p) => acc + (p.stats.maxHp - p.stats.currentHp), 0) || 0;
    const totalTurns = battleLog.filter(l => l.type === 'damage').length;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 md:py-20 bg-background overflow-y-auto">
            {/* Background effects */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.62_0.22_250_/_0.08)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(oklch(0.62 0.22 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.62 0.22 250) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
            </div>

            {/* Confetti particles */}
            {showConfetti && (
                <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-2 w-2 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '100%',
                                backgroundColor: ['oklch(0.62 0.22 250)', 'oklch(0.75 0.14 200)', 'oklch(0.70 0.18 280)'][i % 3],
                                animation: `confetti ${1.5 + Math.random() * 1.5}s ease-out ${Math.random() * 0.5}s forwards`,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8 md:gap-12">
                {/* Victory/Defeat Header */}
                <div className="flex flex-col items-center gap-6 animate-fade-up">
                    <div className={`flex h-24 w-24 items-center justify-center rounded-[2rem] ${isPlayerWinner ? 'bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]' : 'bg-red-500/10 ring-1 ring-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                        }`}>
                        {isPlayerWinner ? (
                            <Trophy className="h-12 w-12 text-primary drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                        ) : (
                            <Skull className="h-12 w-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground text-center uppercase drop-shadow-sm">
                            {isPlayerWinner ? '¡Victoria!' : 'Derrota'}
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground text-center max-w-md leading-relaxed font-medium">
                            {isPlayerWinner
                                ? `¡Felicidades, ${winner.nickname}! Tu estrategia fue impecable.`
                                : `Has luchado valientemente, pero ${winner.nickname} ha prevalecido.`}
                        </p>
                    </div>
                </div>

                {/* Winner Card */}
                <div className="w-full rounded-[2.5rem] border border-primary/20 bg-card/40 backdrop-blur-md p-6 md:p-10 animate-fade-up shadow-2xl" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Crown className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Ganador de la Arena</span>
                    </div>

                    <div className="flex items-center gap-6 mb-10">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-black text-primary uppercase border border-primary/20 shadow-inner">
                            {winner.nickname[0]}
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0">
                            <span className="text-3xl md:text-4xl font-black text-foreground tracking-tight truncate">{winner.nickname}</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{survivingCount}/3 Pokémon en pie</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {winner.team?.map((pokemon) => (
                            <div key={pokemon.id} className="group transition-all duration-300">
                                <PokemonCard pokemon={pokemon} compact={true} isDefeated={pokemon.isDefeated} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Table */}
                <div className="grid w-full grid-cols-3 gap-3 md:gap-4 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                    <div className="group flex flex-col items-center gap-2 rounded-3xl border border-border bg-card/30 backdrop-blur-sm p-6 hover:bg-card/50 transition-all">
                        <span className="text-3xl font-black font-mono text-primary group-hover:scale-110 transition-transform">{survivingCount}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Sobrevivientes</span>
                    </div>
                    <div className="group flex flex-col items-center gap-2 rounded-3xl border border-border bg-card/30 backdrop-blur-sm p-6 hover:bg-card/50 transition-all">
                        <span className="text-3xl font-black font-mono text-purple-400 group-hover:scale-110 transition-transform">{totalDamageDealt}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Daño Infligido</span>
                    </div>
                    <div className="group flex flex-col items-center gap-2 rounded-3xl border border-border bg-card/30 backdrop-blur-sm p-6 hover:bg-card/50 transition-all">
                        <span className="text-3xl font-black font-mono text-foreground group-hover:scale-110 transition-transform">{totalTurns}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Turnos Totales</span>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="w-full flex flex-col items-center gap-6 mt-4 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
                    <button
                        onClick={handlePlayAgain}
                        className="group h-16 w-full md:w-auto min-w-[280px] rounded-2xl bg-foreground text-background font-black px-10 text-sm md:text-base flex items-center justify-center gap-4 transition-all hover:scale-[1.02] hover:bg-muted active:scale-[0.98] shadow-2xl mb-12"
                    >
                        <RotateCcw className="h-5 w-5 group-hover:rotate-[-45deg] transition-transform" />
                        JUGAR DE NUEVO
                    </button>
                </div>
            </div>
        </div>
    );
}

