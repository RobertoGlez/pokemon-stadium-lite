import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { X, Trophy, Swords, Calendar, Crown } from 'lucide-react';

interface GlobalHistoryEntry {
    id: string;
    player1: string;
    player2: string;
    status: 'in_progress' | 'finished';
    winnerName?: string;
    p1Team?: { name: string, spriteUrl: string, isDefeated: boolean }[];
    p2Team?: { name: string, spriteUrl: string, isDefeated: boolean }[];
    createdAt: string;
}

interface BattleHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    serverUrl: string;
}

export const BattleHistoryModal: React.FC<BattleHistoryModalProps> = ({ isOpen, onClose, serverUrl }) => {
    const [history, setHistory] = useState<GlobalHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !serverUrl) return;

        setIsLoading(true);
        const socket: Socket = io(serverUrl, { transports: ['websocket'] });

        socket.on('connect', () => {
            socket.emit('request_global_history');
        });

        socket.on('global_history', (data: GlobalHistoryEntry[]) => {
            // Sort by most recent first
            const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setHistory(sorted);
            setIsLoading(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [isOpen, serverUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0B0F1A] border border-[#1F2937] w-full max-w-2xl rounded-[14px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#1F2937] bg-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2563EB]/10 rounded-[10px]">
                            <Trophy className="w-5 h-5 text-[#2563EB]" />
                        </div>
                        <h2 className="text-[22px] font-semibold text-white tracking-tight">Registro de Batallas</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#111827] rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                            <div className="w-8 h-8 border-2 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin mb-4" />
                            <p className="text-sm font-medium">Cargando historial...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF] text-center">
                            <Swords className="w-12 h-12 text-[#1F2937] mb-4" />
                            <h3 className="text-[18px] font-medium text-white mb-1">Sin batallas registradas</h3>
                            <p className="text-sm">Aún no hay combates en este servidor.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col border border-[#1F2937] rounded-[14px] overflow-hidden bg-[#0B0F1A]">
                            {history.map((entry, index) => {
                                const isFinished = entry.status === 'finished';
                                const p1Won = isFinished && entry.winnerName === entry.player1;
                                const p2Won = isFinished && entry.winnerName === entry.player2;

                                return (
                                <div 
                                    key={entry.id} 
                                    className={`flex items-center justify-between py-3 px-3 sm:px-5 border-[#1F2937]/50 hover:bg-[#111827] transition-colors ${index !== history.length - 1 ? 'border-b' : ''}`}
                                >
                                    {/* Player 1 Side (Left Extreme) */}
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                        <span className={`text-[15px] sm:text-[17px] font-bold truncate max-w-[90px] sm:max-w-[140px] ${p1Won ? 'text-yellow-400' : isFinished ? 'text-[#9CA3AF]' : 'text-white'}`}>
                                            {p1Won && <Crown className="inline w-3.5 h-3.5 text-yellow-500 mb-0.5 mr-1" />}
                                            {entry.player1}
                                        </span>
                                        <div className="flex flex-col">
                                            <div className="flex gap-1 items-center">
                                                {entry.p1Team?.map((poke, i) => (
                                                    <img key={i} src={poke.spriteUrl} alt={poke.name} title={poke.name}
                                                        className={`w-5 h-5 object-contain mix-blend-screen ${poke.isDefeated ? 'grayscale opacity-30 mix-blend-luminosity' : ''}`} crossOrigin="anonymous" />
                                                ))}
                                                {(!entry.p1Team || entry.p1Team.length === 0) && (
                                                    <span className="text-[10px] text-[#4B5563] italic w-5 text-center">?</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-[9px] sm:text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                                                <Calendar className="w-2.5 h-2.5 opacity-70" />
                                                <span>{new Date(entry.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', minute: '2-digit', hour: '2-digit' }).replace(',', '')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center VS */}
                                    <div className="flex items-center justify-center shrink-0 px-2 sm:px-6">
                                        <span className="text-[20px] sm:text-[24px] font-black italic text-[#374151]">VS</span>
                                    </div>

                                    {/* Player 2 Side (Right Extreme) */}
                                    <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
                                        <div className="flex flex-col items-end">
                                            <div className="flex gap-1 items-center justify-end">
                                                {entry.p2Team?.map((poke, i) => (
                                                    <img key={i} src={poke.spriteUrl} alt={poke.name} title={poke.name}
                                                        className={`w-5 h-5 object-contain mix-blend-screen ${poke.isDefeated ? 'grayscale opacity-30 mix-blend-luminosity' : ''}`} crossOrigin="anonymous" />
                                                ))}
                                                {(!entry.p2Team || entry.p2Team.length === 0) && (
                                                    <span className="text-[10px] text-[#4B5563] italic w-5 text-center">?</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                                                <span className={`w-1.5 h-1.5 rounded-full ${!isFinished ? 'bg-[#22C55E] animate-pulse drop-shadow-[0_0_4px_rgba(34,197,94,0.8)]' : 'bg-[#4B5563]'}`} />
                                                <span className={!isFinished ? 'text-[#22C55E]' : 'text-[#6B7280]'}>{!isFinished ? 'En curso' : 'Finalizado'}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[15px] sm:text-[17px] font-bold truncate max-w-[90px] sm:max-w-[140px] text-right ${p2Won ? 'text-yellow-400' : isFinished ? 'text-[#9CA3AF]' : 'text-white'}`}>
                                            {entry.player2}
                                            {p2Won && <Crown className="inline w-3.5 h-3.5 text-yellow-500 mb-0.5 ml-1" />}
                                        </span>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
