import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../../core/context/LobbyContext';
import { Globe } from '../../../shared/components/magicui/globe';
import { Loader2, Users, ArrowLeft } from 'lucide-react';

export function LobbyRoom() {
    const navigate = useNavigate();
    const { players, localNickname, disconnect, isConnected } = useLobby();
    const waitingForOpponent = players.length < 2;

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
            <div className="z-20 flex items-center gap-4 mb-6 w-full max-w-md mt-2">
                <button
                    onClick={() => disconnect()}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold tracking-wide m-0 flex-1 text-center pr-12">Stadium Lite</h1>
            </div>

            {/* Foreground Content */}
            <div className="z-10 flex flex-col items-center justify-center space-y-8 w-full max-w-md bg-background/60 backdrop-blur-md p-6 rounded-3xl border border-border shadow-2xl">

                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Sala de Espera Mundial</h2>
                    <div className="flex items-center justify-center gap-2 text-primary">
                        {waitingForOpponent ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-medium animate-pulse">Esperando contendiente...</span>
                            </>
                        ) : (
                            <span className="font-medium text-green-500">¡Contendiente Encontrado!</span>
                        )}
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground font-medium">
                        <Users className="w-4 h-4" />
                        <span>Jugadores Conectados ({players.length}/2)</span>
                    </div>

                    <ul className="space-y-2">
                        {players.map((p) => (
                            <li
                                key={p.nickname}
                                className={`flex items-center justify-between p-4 rounded-xl border ${p.nickname === localNickname
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card'
                                    } transition-colors`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${p.nickname === localNickname ? 'bg-primary animate-pulse' : 'bg-red-500'}`} />
                                    <span className="font-semibold text-lg">{p.nickname}</span>
                                </div>
                                {p.nickname === localNickname && (
                                    <span className="text-xs font-bold px-2 py-1 bg-primary text-primary-foreground rounded-full">TÚ</span>
                                )}
                            </li>
                        ))}

                        {waitingForOpponent && (
                            <li className="flex items-center justify-center p-4 rounded-xl border border-dashed border-border text-muted-foreground bg-transparent">
                                <span className="italic">Buscando rival...</span>
                            </li>
                        )}
                    </ul>
                </div>

            </div>
        </div>
    );
}
