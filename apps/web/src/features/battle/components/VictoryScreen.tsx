import { useEffect, useState } from 'react';
import { useLobby } from '../../../core/context/LobbyContext';
import { PokemonCard } from '../../../shared/components/pokemon/PokemonCard';
import { Trophy, RotateCcw, ChevronRight, Crown, Skull } from 'lucide-react';

export function VictoryScreen() {
    const { players, winnerId, localNickname, battleLog, disconnect } = useLobby();
    const [showConfetti, setShowConfetti] = useState(false);

    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id !== winnerId);
    const isPlayerWinner = winner?.nickname === localNickname;

    useEffect(() => {
        setShowConfetti(true);
        const timeout = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timeout);
    }, []);

    if (!winner || !loser) return null;

    // Count surviving pokemon
    const survivingCount = winner.team?.filter(p => !p.isDefeated).length || 0;
    // Calculate total damage dealt by winner (sum of missing HP of loser's team)
    const totalDamageDealt = loser.team?.reduce((acc, p) => acc + (p.stats.maxHp - p.stats.currentHp), 0) || 0;
    const totalTurns = battleLog.filter(l => l.type === 'damage').length;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4 py-8 bg-black/90 backdrop-blur-md overflow-y-auto">
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

            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 mt-16 md:mt-0">
                {/* Victory/Defeat Header */}
                <div className="flex flex-col items-center gap-4 animate-fade-up">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${isPlayerWinner ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-red-500/10 ring-1 ring-red-500/20'
                        }`}>
                        {isPlayerWinner ? (
                            <Trophy className="h-10 w-10 text-primary drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                        ) : (
                            <Skull className="h-10 w-10 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-center uppercase drop-shadow-md">
                            {isPlayerWinner ? '¡Victoria!' : 'Derrota'}
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground text-center max-w-sm leading-relaxed font-mono">
                            {isPlayerWinner
                                ? `¡Felicidades, ${winner.nickname}! Dominaste la arena.`
                                : `${winner.nickname} ha ganado la batalla. ¡Mejor suerte la próxima vez!`}
                        </p>
                    </div>
                </div>

                {/* Winner Card */}
                <div className="w-full rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm p-4 md:p-6 animate-fade-up shadow-xl" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <Crown className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-widest text-primary">Ganador</span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0F172A] text-2xl font-black text-primary uppercase border border-primary/20 shadow-inner">
                            {winner.nickname[0]}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-black text-foreground tracking-tight truncate max-w-[200px]">{winner.nickname}</span>
                            <span className="text-xs text-muted-foreground font-mono">{survivingCount}/3 Pokémon restantes</span>
                        </div>
                        <div className="ml-auto px-4 py-1.5 bg-primary/10 text-primary border border-primary/30 text-[10px] font-black uppercase rounded-full tracking-widest shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.1)]">
                            Ganador
                        </div>
                    </div>

                    {/* Winner's team */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6">
                        {winner.team?.map((pokemon) => (
                            <div key={pokemon.id} className="mx-auto sm:mx-0 sm:w-full">
                                <PokemonCard pokemon={pokemon} compact={true} isDefeated={pokemon.isDefeated} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid w-full grid-cols-3 gap-2 md:gap-4 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 hover:bg-card/80 transition-colors">
                        <span className="text-2xl font-black font-mono text-primary">{survivingCount}</span>
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Supervivientes</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 hover:bg-card/80 transition-colors">
                        <span className="text-2xl font-black font-mono text-purple-400">{totalDamageDealt}</span>
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Daño Total</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 hover:bg-card/80 transition-colors">
                        <span className="text-2xl font-black font-mono text-foreground">{totalTurns}</span>
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Turnos</span>
                    </div>
                </div>

                {/* Battle Log Summary */}
                <div className="w-full rounded-2xl border border-border bg-[#050811] p-4 animate-fade-up shadow-inner" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
                    <div className="mb-3 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registro de Batalla</span>
                    </div>
                    <div className="flex max-h-40 md:max-h-48 flex-col gap-1.5 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        {battleLog.map((log) => (
                            <div key={log.id} className="flex items-start gap-1.5">
                                <ChevronRight className={`mt-0.5 h-3 w-3 flex-shrink-0 ${log.type === 'damage' ? 'text-red-500' :
                                    log.type === 'defeat' ? 'text-orange-500' :
                                        log.type === 'winner' ? 'text-green-500' :
                                            log.type === 'switch' ? 'text-blue-500' :
                                                log.type === 'info' ? 'text-primary' :
                                                    'text-muted-foreground'
                                    }`} />
                                <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">{log.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Play Again */}
                <button
                    onClick={disconnect}
                    className="h-14 w-full md:w-auto min-w-[200px] rounded-xl bg-foreground text-background font-black px-8 text-sm md:text-base flex items-center justify-center gap-3 transition-all animate-fade-up hover:scale-105 hover:bg-muted shadow-[0_0_30px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background mb-8"
                    style={{ animationDelay: '800ms', animationFillMode: 'both' }}
                >
                    <RotateCcw className="h-5 w-5" />
                    JUGAR DE NUEVO
                </button>
            </div>
        </div>
    );
}

