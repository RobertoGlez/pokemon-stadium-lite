import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../../core/context/LobbyContext';
import { Swords, Zap, Shield, ChevronRight, Clock } from 'lucide-react';
// Removed VictoryScreen import from here as it's now a route

const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
        grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
        ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
        rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705898',
        steel: '#B7B7CE', fairy: '#D685AD',
    };
    return colors[type.toLowerCase()] || '#777';
};

// Custom minimal HpBar inline mimicking POC
function MiniHpBar({ currentHp, maxHp, label }: { currentHp: number; maxHp: number; label: string }) {
    const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    let colorClass = 'bg-[#22C55E]';
    if (percentage <= 20) colorClass = 'bg-[#EF4444]';
    else if (percentage <= 50) colorClass = 'bg-[#F59E0B]';

    return (
        <div className="flex w-full items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
            <div className="flex-1 w-full bg-gray-900 rounded-full h-1.5 overflow-hidden relative">
                <div
                    className={`h-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-foreground">
                {currentHp}/{maxHp}
            </span>
        </div>
    );
}

function StatChip({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center gap-0.5 rounded-lg bg-card border border-border px-2 py-1.5 shadow-sm">
            <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className="text-[11px] font-bold font-mono text-foreground">{value}</span>
        </div>
    );
}

function AttackButton({ isMyTurn, isAttacking, onAttack, lobbyStatus }: {
    isMyTurn: boolean; isAttacking: boolean; onAttack: () => void; lobbyStatus: string
}) {
    return (
        <button
            onClick={onAttack}
            disabled={!isMyTurn || isAttacking || lobbyStatus !== 'battling'}
            className={`h-12 w-full rounded-xl flex justify-center items-center font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary ${isMyTurn && !isAttacking
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-[1.02]'
                : 'bg-card border border-border text-muted-foreground cursor-not-allowed opacity-70'
                }`}
        >
            {isMyTurn && !isAttacking ? (
                <span className="flex items-center gap-2">
                    <Swords className="h-4 w-4" />
                    ATACAR!
                </span>
            ) : isAttacking ? (
                <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 animate-pulse" />
                    Atacando...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Esperando...
                </span>
            )}
        </button>
    );
}

export function BattleArena() {
    const navigate = useNavigate();
    const { isConnected, lobbyStatus, currentTurnPlayerId, players, localNickname, emitAttack, lastDamageEvent, battleLog } = useLobby();

    const [isAttacking, setIsAttacking] = useState(false);
    const [activeDamage, setActiveDamage] = useState<{ defenderId: string; damage: number; timestamp: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'actions' | 'team' | 'log'>('actions');
    const logRef = useRef<HTMLDivElement>(null);

    // Route Guard
    useEffect(() => {
        if (!isConnected || (lobbyStatus !== 'battling' && lobbyStatus !== 'finished')) {
            navigate('/lobby');
        }
    }, [isConnected, lobbyStatus, navigate]);

    // Auto-scroll log
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [battleLog, activeTab]);

    // Listen to damage events sequentially for animations
    useEffect(() => {
        if (!lastDamageEvent) return;

        setActiveDamage(lastDamageEvent);
        setIsAttacking(false);

        const timer = setTimeout(() => {
            setActiveDamage(curr => curr?.timestamp === lastDamageEvent.timestamp ? null : curr);
        }, 800);

        return () => clearTimeout(timer);
    }, [lastDamageEvent]);

    // Handle game finished transition
    useEffect(() => {
        if (lobbyStatus === 'finished') {
            const timer = setTimeout(() => {
                navigate('/results');
            }, 2000); // Small delay to see last action results
            return () => clearTimeout(timer);
        }
    }, [lobbyStatus, navigate]);

    if (!isConnected || (lobbyStatus !== 'battling' && lobbyStatus !== 'finished')) return null;

    const localPlayer = players.find(p => p.nickname === localNickname);
    const opponent = players.find(p => p.nickname !== localNickname);

    const isMyTurn = currentTurnPlayerId === localPlayer?.id;

    const myActive = localPlayer?.team?.find(p => !p.isDefeated) || localPlayer?.team?.[(localPlayer?.team?.length || 1) - 1];
    const oppActive = opponent?.team?.find(p => !p.isDefeated) || opponent?.team?.[(opponent?.team?.length || 1) - 1];
    const foundMyActiveIndex = localPlayer?.team?.findIndex(p => !p.isDefeated) ?? -1;
    const myActiveIndex = foundMyActiveIndex !== -1 ? foundMyActiveIndex : (localPlayer?.team?.length || 1) - 1;

    const handleAttack = () => {
        setIsAttacking(true);
        emitAttack();
    };

    if (!localPlayer || !opponent || !myActive || !oppActive) return null;

    return (
        <div className="flex h-screen flex-col bg-background text-foreground font-sans selection:bg-none overflow-hidden">
            {/* Arena BG */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
            </div>

            {/* Top Bar */}
            <header className="relative z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight">Pokémon Stadium Lite</span>
                </div>
                <div className="flex items-center gap-1.5 border border-primary/30 rounded-full px-2.5 py-1 bg-primary/10">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-[10px] font-bold text-primary uppercase">LIVE</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono font-medium text-muted-foreground relative">
                        {isMyTurn ? <span className="text-green-400">Tu Turno</span> : 'Turno Enemigo'}
                    </span>
                </div>
            </header>

            {/* Battle Field */}
            <div className="relative z-10 flex flex-1 flex-col justify-center gap-4 px-4 py-4 md:px-8 md:py-6 max-w-5xl mx-auto w-full min-h-0">

                {/* --- OPPONENT SIDE --- */}
                <div className="flex items-center gap-4 md:gap-8 justify-between w-full h-1/2 md:h-2/5">
                    {/* Opponent HP/Info */}
                    <div className="flex flex-1 flex-col gap-2 min-w-0 pt-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-[10px] font-bold text-red-500 uppercase border border-red-500/20 shrink-0">
                                {opponent.nickname[0]}
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground truncate">{opponent.nickname}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm md:text-base font-bold text-foreground truncate uppercase tracking-wide">{oppActive.name}</span>
                            <div className="flex gap-1 flex-shrink-0">
                                {oppActive.types.map(t => (
                                    <span key={t} className="inline-flex h-4 px-1.5 items-center rounded text-[8px] font-black uppercase tracking-wider"
                                        style={{ backgroundColor: `${getTypeColor(t)}20`, color: getTypeColor(t), border: `1px solid ${getTypeColor(t)}40` }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <MiniHpBar currentHp={oppActive.stats.currentHp} maxHp={oppActive.stats.maxHp} label="HP" />
                    </div>

                    {/* Opponent Sprite */}
                    <div className={`relative flex h-28 w-28 flex-shrink-0 items-center justify-center md:h-40 md:w-40 transition-transform duration-100 ${activeDamage && activeDamage.defenderId !== opponent.id ? '-translate-x-4 translate-y-4 brightness-150' : ''
                        } ${activeDamage?.defenderId === opponent.id ? 'brightness-150 sepia hue-rotate-[-50deg] saturate-[3] drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''
                        } ${oppActive.stats.currentHp === 0 ? 'translate-y-8 opacity-0 scale-75 duration-[1200ms] ease-in transition-all' : ''
                        }`}>
                        <div className="absolute inset-0 rounded-full bg-red-500/5 blur-2xl pointer-events-none" />
                        <img
                            src={oppActive.spriteUrl}
                            alt={oppActive.name}
                            className="relative z-10 h-24 w-24 object-contain md:h-32 md:w-32 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] filter"
                            crossOrigin="anonymous"
                        />
                        {activeDamage?.defenderId === opponent.id && (
                            <div className="absolute -top-2 right-0 z-20 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
                                <span className="text-xl font-black text-red-500 font-mono drop-shadow-md">-{activeDamage.damage}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* VS Divider */}
                <div className="flex items-center gap-4 opacity-50 my-auto shrink-0">
                    <div className="h-px flex-1 bg-border" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-card">
                        <span className="text-[10px] font-black text-primary">VS</span>
                    </div>
                    <div className="h-px flex-1 bg-border" />
                </div>

                {/* --- PLAYER SIDE --- */}
                <div className="flex items-center gap-4 md:gap-8 justify-between w-full flex-row-reverse h-1/2 md:h-2/5 pb-2">
                    {/* Player HP/Info */}
                    <div className="flex flex-1 flex-col gap-2 min-w-0 items-end text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-[10px] font-bold text-blue-500 uppercase border border-blue-500/20 shrink-0">
                                {localPlayer.nickname[0]}
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground truncate">{localPlayer.nickname}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-row-reverse w-full">
                            <span className="text-sm md:text-base font-bold text-foreground truncate uppercase tracking-wide">{myActive.name}</span>
                            <div className="flex gap-1 flex-shrink-0">
                                {myActive.types.map(t => (
                                    <span key={t} className="inline-flex h-4 px-1.5 items-center rounded text-[8px] font-black uppercase tracking-wider"
                                        style={{ backgroundColor: `${getTypeColor(t)}20`, color: getTypeColor(t), border: `1px solid ${getTypeColor(t)}40` }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <MiniHpBar currentHp={myActive.stats.currentHp} maxHp={myActive.stats.maxHp} label="HP" />
                    </div>

                    {/* Player Sprite */}
                    <div className={`relative flex h-28 w-28 flex-shrink-0 items-center justify-center md:h-40 md:w-40 transition-transform duration-100 ${activeDamage && activeDamage.defenderId !== localPlayer.id ? 'translate-x-4 -translate-y-4 brightness-150' : ''
                        } ${activeDamage?.defenderId === localPlayer.id ? 'brightness-150 sepia hue-rotate-[-50deg] saturate-[3] drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''
                        } ${myActive.stats.currentHp === 0 ? 'translate-y-8 opacity-0 scale-75 duration-[1200ms] ease-in transition-all' : ''
                        }`}>
                        <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
                        <img
                            src={myActive.spriteUrl}
                            alt={myActive.name}
                            className="relative z-10 h-24 w-24 object-contain md:h-32 md:w-32 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)] filter scale-x-[-1]"
                            crossOrigin="anonymous"
                        />
                        {activeDamage?.defenderId === localPlayer.id && (
                            <div className="absolute -top-2 left-0 z-20 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
                                <span className="text-xl font-black text-red-500 font-mono drop-shadow-md">-{activeDamage.damage}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Bottom Panel - Tabs on mobile */}
            <div className="relative z-10 border-t border-border bg-card/95 backdrop-blur-md pb-safe shrink-0">
                {/* Tab Navigation - mobile only */}
                <div className="flex flex-none border-b border-border md:hidden">
                    {(['actions', 'team', 'log'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground hover:bg-white/5'
                                }`}
                        >
                            {tab === 'actions' ? 'Ataque' : tab === 'team' ? 'Equipo' : 'Log'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-4 md:p-6 w-full max-w-5xl mx-auto h-[210px] md:h-auto">
                    {/* Desktop: show all side by side */}
                    <div className="hidden md:flex md:gap-6 md:items-start h-full">
                        {/* Attack */}
                        <div className="flex flex-2 flex-col gap-3 min-w-[280px]">
                            <AttackButton isMyTurn={isMyTurn} isAttacking={isAttacking} onAttack={handleAttack} lobbyStatus={lobbyStatus} />
                            <div className="grid grid-cols-4 gap-2">
                                <StatChip label="ATK" value={myActive.stats.attack} />
                                <StatChip label="DEF" value={myActive.stats.defense} />
                                <StatChip label="SPD" value={myActive.stats.speed} />
                                <StatChip label="HP" value={myActive.stats.currentHp} />
                            </div>
                        </div>
                        {/* Team */}
                        <div className="flex flex-col gap-2 w-72 border-l border-border pl-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tu Equipo</span>
                            <div className="flex flex-col gap-2">
                                {localPlayer.team?.map((pokemon, i) => (
                                    <div key={pokemon.id} className={`flex items-center gap-3 rounded-xl border p-2 transition-all ${pokemon.isDefeated ? 'border-red-500/20 bg-red-500/5 opacity-50 grayscale'
                                        : i === myActiveIndex ? 'border-primary/40 bg-primary/10 shadow-[0_0_10px_rgba(37,99,235,0.1)]' : 'border-border bg-card/50'
                                        }`}>
                                        <img src={pokemon.spriteUrl} alt={pokemon.name} className="h-8 w-8 object-contain" crossOrigin="anonymous" />
                                        <div className="flex flex-1 flex-col justify-center overflow-hidden">
                                            <span className="text-[11px] font-bold text-foreground truncate uppercase">{pokemon.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-[9px] font-mono text-muted-foreground">{pokemon.stats.currentHp}/{pokemon.stats.maxHp}</span>
                                            {i === myActiveIndex && !pokemon.isDefeated && (
                                                <span className="text-[8px] font-black text-primary uppercase">Activo</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Log */}
                        <div className="flex flex-col gap-2 flex-1 border-l border-border pl-6 h-full">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registro</span>
                            <div ref={logRef} className="flex h-[148px] flex-col gap-1.5 overflow-y-auto rounded-xl border border-border bg-[#050811] p-3 scroll-smooth scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                {battleLog.map((log) => (
                                    <div key={log.id} className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <ChevronRight className={`mt-0.5 h-3 w-3 flex-shrink-0 ${log.type === 'damage' ? 'text-red-500' : log.type === 'defeat' ? 'text-orange-500' : log.type === 'winner' ? 'text-green-500' : log.type === 'switch' ? 'text-blue-500' : 'text-muted-foreground'
                                            }`} />
                                        <p className="text-[11px] font-mono text-muted-foreground/90 leading-relaxed">{log.message}</p>
                                    </div>
                                ))}
                                {battleLog.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">Esperando acciones...</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile: tabbed content */}
                    <div className="md:hidden h-full">
                        {activeTab === 'actions' && (
                            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                                <AttackButton isMyTurn={isMyTurn} isAttacking={isAttacking} onAttack={handleAttack} lobbyStatus={lobbyStatus} />
                                <div className="grid grid-cols-4 gap-2">
                                    <StatChip label="ATK" value={myActive.stats.attack} />
                                    <StatChip label="DEF" value={myActive.stats.defense} />
                                    <StatChip label="SPD" value={myActive.stats.speed} />
                                    <StatChip label="HP" value={myActive.stats.currentHp} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'team' && (
                            <div className="flex h-full flex-col gap-2 animate-in fade-in duration-200 overflow-y-auto">
                                {localPlayer.team?.map((pokemon, i) => (
                                    <div key={pokemon.id} className={`flex items-center gap-3 rounded-xl border p-2.5 ${pokemon.isDefeated ? 'border-red-500/20 bg-red-500/5 opacity-50 grayscale'
                                        : i === myActiveIndex ? 'border-primary/40 bg-primary/10 shadow-[0_0_10px_rgba(37,99,235,0.1)]' : 'border-border bg-card'
                                        }`}>
                                        <img src={pokemon.spriteUrl} alt={pokemon.name} className="h-10 w-10 object-contain" crossOrigin="anonymous" />
                                        <div className="flex flex-1 flex-col min-w-0">
                                            <span className="text-sm font-bold text-foreground truncate uppercase">{pokemon.name}</span>
                                            <span className="text-[11px] font-mono text-muted-foreground">{pokemon.stats.currentHp}/{pokemon.stats.maxHp} HP</span>
                                        </div>
                                        {pokemon.isDefeated && <span className="text-[10px] font-black text-red-500 border border-red-500/20 px-2 py-0.5 rounded bg-red-500/10">KO</span>}
                                        {i === myActiveIndex && !pokemon.isDefeated && (
                                            <span className="text-[10px] font-black text-primary border border-primary/20 px-2 py-0.5 rounded bg-primary/10">ACTIVO</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'log' && (
                            <div ref={logRef} className="flex h-[155px] flex-col gap-1.5 overflow-y-auto rounded-xl border border-border bg-[#050811] p-3 animate-in fade-in duration-200 scroll-smooth">
                                {battleLog.map((log) => (
                                    <div key={log.id} className="flex items-start gap-2">
                                        <ChevronRight className={`mt-0.5 h-3 w-3 flex-shrink-0 ${log.type === 'damage' ? 'text-red-500' : log.type === 'defeat' ? 'text-orange-500' : log.type === 'winner' ? 'text-green-500' : log.type === 'switch' ? 'text-blue-500' : 'text-muted-foreground'
                                            }`} />
                                        <p className="text-[11.5px] font-mono text-muted-foreground/90 leading-relaxed">{log.message}</p>
                                    </div>
                                ))}
                                {battleLog.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">Esperando acciones...</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
