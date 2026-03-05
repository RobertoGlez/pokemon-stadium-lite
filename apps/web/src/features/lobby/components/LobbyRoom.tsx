import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../../core/context/LobbyContext';
import { Globe } from '../../../shared/components/magicui/globe';
import { Loader2, Users, ArrowLeft, RefreshCw, CheckSquare } from 'lucide-react';
import { PokemonCard } from '../../../shared/components/pokemon/PokemonCard';

export function LobbyRoom() {
    const navigate = useNavigate();
    const { players, localNickname, disconnect, isConnected, requestTeam } = useLobby();
    const waitingForOpponent = players.length < 2;

    const localPlayer = players.find(p => p.nickname === localNickname);
    const hasTeam = localPlayer?.team && localPlayer.team.length > 0;

    // Guard route
    useEffect(() => {
        if (!isConnected) {
            navigate('/');
        }
    }, [isConnected, navigate]);

    if (!isConnected) return null;

    return (
        <div className="relative flex flex-col items-center min-h-screen p-4 bg-background overflow-hidden text-foreground dark">

            {/* Background Globe Component */}
            <Globe className="opacity-80 translate-y-24 scale-125 md:scale-100 mix-blend-screen pointer-events-none" />

            {/* Top Header */}
            <div className="z-20 flex items-center gap-4 mb-6 w-full max-w-4xl mt-2">
                <button
                    onClick={() => disconnect()}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-semibold">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {players.length}/2 Conectados
                </div>
            </div>

            {/* Foreground Content */}
            <div className="z-10 flex flex-col items-center justify-center space-y-8 w-full max-w-4xl mt-4">

                <div className="text-center space-y-4 bg-background/60 backdrop-blur-md p-6 rounded-[14px] border border-border shadow-2xl min-w-[320px]">
                    <h2 className="text-2xl font-bold tracking-tight">Sala de Espera</h2>
                    <div className="flex items-center justify-center gap-2 text-primary">
                        {waitingForOpponent ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="font-medium animate-pulse text-sm">Esperando contendiente...</span>
                            </>
                        ) : (
                            <span className="font-medium text-green-500 text-sm">¡Contendiente Encontrado!</span>
                        )}
                    </div>
                </div>

                {/* Team Selection Section */}
                <div className="w-full flex justify-center py-4">
                    {!hasTeam ? (
                        // No Team assigned yet state
                        <button
                            onClick={requestTeam}
                            className="bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(37,99,235,0.4)] px-8 py-4 rounded-xl font-bold tracking-wide flex items-center gap-3 group"
                        >
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Randomize Team
                        </button>
                    ) : (
                        // Team received state
                        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Your Assigned Team</span>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                {localPlayer?.team?.map((pokemon) => (
                                    <PokemonCard key={pokemon.id} pokemon={pokemon} />
                                ))}
                            </div>

                            <button
                                className="mt-8 relative group overflow-hidden bg-background border border-primary text-primary hover:text-white hover:border-transparent transition-all duration-300 ease-out px-10 py-3 rounded-xl font-bold tracking-wide flex items-center gap-2 hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                            >
                                <div className="absolute inset-0 w-full h-full bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                                <CheckSquare className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110 duration-300" />
                                <span className="relative z-10 tracking-widest">READY FOR BATTLE</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
