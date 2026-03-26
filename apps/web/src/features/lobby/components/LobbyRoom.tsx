import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLobby } from '../../../core/context/LobbyContext';
import { Globe } from '../../../shared/components/magicui/globe';
import { Loader2, ArrowLeft, RefreshCw, CheckSquare, Clock, CircleCheck, Users } from 'lucide-react';
import { PokemonCard } from '../../../shared/components/pokemon/PokemonCard';

export function LobbyRoom() {
    const { t } = useTranslation('lobby');
    const navigate = useNavigate();
    const { players, localNickname, disconnect, isConnected, requestTeam, emitReady, lobbyStatus, isRequestingTeam, socketActionError, clearSocketActionError } = useLobby();
    const waitingForOpponent = players.length < 2;

    const localPlayer = players.find(p => p.nickname === localNickname);
    const opponent = players.find(p => p.nickname !== localNickname);
    const hasTeam = localPlayer?.team && localPlayer.team.length > 0;
    const isReadyLocally = localPlayer?.isReady === true;

    // Guard route to Login
    useEffect(() => {
        if (!isConnected) {
            navigate('/');
        }
    }, [isConnected, navigate]);

    // Transition to Battle Arena when match officially starts
    useEffect(() => {
        if (lobbyStatus === 'battling') {
            navigate('/battle');
        }
    }, [lobbyStatus, navigate]);

    if (!isConnected) return null;

    // Avatar initials
    const avatarLetter = localNickname?.charAt(0).toUpperCase() || '?';
    const opponentLetter = opponent?.nickname?.charAt(0).toUpperCase() || '?';

    return (
        <div className="relative flex flex-col items-center min-h-screen p-4 bg-background overflow-hidden text-foreground dark">

            {/* Background Globe */}
            <Globe className="opacity-60 translate-y-24 scale-125 md:scale-100 mix-blend-screen pointer-events-none" />

            {/* Top Back Button */}
            <div className="z-20 flex items-center w-full max-w-3xl mt-2 mb-8">
                <button
                    onClick={() => disconnect()}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-card"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            {socketActionError && (
                <div className="z-20 w-full max-w-3xl mb-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <span className="flex-1">{socketActionError}</span>
                    <button
                        type="button"
                        onClick={() => clearSocketActionError()}
                        className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold hover:bg-destructive/20"
                    >
                        OK
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center w-full max-w-3xl gap-8">

                {/* Title Block */}
                <div className="flex flex-col items-center gap-3">
                    {/* Status Pill */}
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1F2937] bg-[#111827] text-xs font-semibold text-[#9CA3AF]">
                        <span className={`w-2 h-2 rounded-full ${waitingForOpponent
                            ? 'bg-primary animate-pulse shadow-[0_0_5px_rgba(37,99,235,0.8)]'
                            : 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]'}`}
                        />
                        {waitingForOpponent ? t('statusActive') : t('opponentFound')}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">{t('title')}</h1>
                </div>

                {/* Player Cards Row */}
                <div className="w-full flex flex-col md:flex-row items-stretch gap-4">

                    {/* Local Player Card */}
                    <div className="flex-1 bg-[#111827] border border-[#1F2937] rounded-[14px] p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                            {avatarLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{localNickname}</p>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">
                                {hasTeam ? t('pokemonAssigned', { count: localPlayer?.team?.length }) : t('noTeamYet')}
                            </p>
                        </div>
                        <CircleCheck className={`w-5 h-5 shrink-0 transition-colors ${isReadyLocally ? 'text-green-500' : 'text-[#1F2937]'}`} />
                    </div>

                    {/* VS Divider */}
                    <div className="flex items-center justify-center md:flex-col px-2">
                        <span className="text-sm font-black text-[#9CA3AF]/40 tracking-widest">VS</span>
                    </div>

                    {/* Opponent Card */}
                    {opponent ? (
                        <div className="flex-1 bg-[#111827] border border-[#1F2937] rounded-[14px] p-4 flex items-center gap-4 animate-in fade-in duration-500">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-lg shrink-0">
                                {opponentLetter}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{opponent.nickname}</p>
                                <p className="text-xs text-[#9CA3AF] mt-0.5">
                                    {opponent.team && opponent.team.length > 0
                                        ? t('pokemonAssigned', { count: opponent.team.length })
                                        : t('noTeamYet')}
                                </p>
                            </div>
                            <CircleCheck className={`w-5 h-5 shrink-0 transition-colors ${opponent.isReady ? 'text-green-500' : 'text-[#1F2937]'}`} />
                        </div>
                    ) : (
                        /* Waiting Slot */
                        <div className="flex-1 border border-dashed border-[#1F2937] rounded-[14px] p-4 flex items-center gap-4 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-[#9CA3AF]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[#9CA3AF] font-medium text-sm">{t('waitingOpponent')}</p>
                            </div>
                            <Clock className="w-5 h-5 text-[#9CA3AF] shrink-0 animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Team & Action Section */}
                <div className="w-full flex flex-col items-center gap-6">
                    {!hasTeam ? (
                        <button
                            onClick={requestTeam}
                            disabled={isRequestingTeam}
                            className={`px-8 py-3 rounded-xl font-bold tracking-wide flex items-center gap-3 group transition-all h-12
                                ${isRequestingTeam
                                    ? 'bg-primary/60 text-primary-foreground/60 cursor-not-allowed'
                                    : 'bg-primary text-white hover:brightness-110 active:scale-95 shadow-[0_4px_20px_rgba(37,99,235,0.4)]'
                                }`}
                        >
                            {isRequestingTeam ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('assigning')}
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    {t('generateTeam')}
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500 w-full">
                            <span className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF]">{t('yourAssignedTeam')}</span>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                {localPlayer?.team?.map((pokemon) => (
                                    <PokemonCard key={pokemon.id} pokemon={pokemon} />
                                ))}
                            </div>

                            {/* Ready Button */}
                            <button
                                onClick={emitReady}
                                disabled={isReadyLocally || waitingForOpponent}
                                className={`relative group overflow-hidden border transition-all duration-300 ease-out px-10 py-3 rounded-xl font-bold tracking-widest flex items-center gap-2 h-12
                                    ${isReadyLocally || waitingForOpponent
                                        ? 'opacity-50 cursor-not-allowed bg-card border-[#1F2937] text-[#9CA3AF]'
                                        : 'bg-background border-primary text-primary hover:text-white hover:border-transparent hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]'
                                    }`}
                            >
                                {!isReadyLocally && !waitingForOpponent && (
                                    <div className="absolute inset-0 w-full h-full bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                                )}
                                <CheckSquare className={`w-5 h-5 relative z-10 ${!isReadyLocally && !waitingForOpponent ? 'group-hover:scale-110 transition-transform duration-300' : ''}`} />
                                <span className="relative z-10">
                                    {isReadyLocally ? t('waitingForOpponent') : t('readyForBattle')}
                                </span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
