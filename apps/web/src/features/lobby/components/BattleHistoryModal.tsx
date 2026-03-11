import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { X, Trophy, Swords, Crown } from 'lucide-react';

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
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {history.map((entry) => {
                                const isFinished = entry.status === 'finished';
                                const p1Won = isFinished && entry.winnerName === entry.player1;
                                const p2Won = isFinished && entry.winnerName === entry.player2;

                                return (
                                <div key={entry.id} className="flex flex-col bg-[#111827] rounded-[14px] border border-[#1F2937] overflow-hidden transition-all hover:bg-[#111827]/80">
                                    {/* Main Slab: Players & VS */}
                                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
                                        
                                        {/* Player 1 Left */}
                                        <div className="flex flex-col gap-2 min-w-[70px] sm:min-w-[100px]">
                                            <span className={`text-[#F9FAFB] text-[16px] sm:text-[18px] truncate font-medium tracking-wide ${p1Won ? 'text-yellow-400 font-bold' : ''}`}>
                                                {p1Won && <Crown className="inline w-3.5 h-3.5 text-yellow-500 mb-1 mr-1.5" />}
                                                {entry.player1}
                                            </span>
                                            <div className="flex gap-2 items-center">
                                                {entry.p1Team?.map((poke, i) => (
                                                    <img key={i} src={poke.spriteUrl} alt={poke.name} title={poke.name}
                                                        className={`w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] object-contain drop-shadow-sm ${poke.isDefeated ? 'grayscale opacity-30 mix-blend-luminosity' : ''}`} crossOrigin="anonymous" />
                                                ))}
                                                {(!entry.p1Team || entry.p1Team.length === 0) && (
                                                    <span className="text-[12px] text-[#9CA3AF] italic w-5 text-left flex items-center h-[28px]">?</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Center VS */}
                                        <div className="flex items-center justify-center shrink-0">
                                            <span className="text-[#374151] text-[22px] sm:text-[32px] font-black italic tracking-wider opacity-60">VS</span>
                                        </div>

                                        {/* Player 2 Right */}
                                        <div className="flex flex-col gap-2 min-w-[70px] sm:min-w-[100px] items-end text-right">
                                            <span className={`text-[#F9FAFB] text-[16px] sm:text-[18px] truncate font-medium tracking-wide ${p2Won ? 'text-yellow-400 font-bold' : ''}`}>
                                                {entry.player2}
                                                {p2Won && <Crown className="inline w-3.5 h-3.5 text-yellow-500 mb-1 ml-1.5" />}
                                            </span>
                                            <div className="flex gap-2 items-center justify-end">
                                                {entry.p2Team?.map((poke, i) => (
                                                    <img key={i} src={poke.spriteUrl} alt={poke.name} title={poke.name}
                                                        className={`w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] object-contain drop-shadow-sm ${poke.isDefeated ? 'grayscale opacity-30 mix-blend-luminosity' : ''}`} crossOrigin="anonymous" />
                                                ))}
                                                {(!entry.p2Team || entry.p2Team.length === 0) && (
                                                    <span className="text-[12px] text-[#9CA3AF] italic w-5 text-right flex justify-end items-center h-[28px]">?</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Slab: Status and Timestamp - Integrated seamlessly */}
                                    <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#0B0F1A]/40 border-t border-[#1F2937]">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${!isFinished ? 'bg-[#22C55E] animate-pulse drop-shadow-[0_0_4px_rgba(34,197,94,0.8)]' : 'bg-[#4B5563]'}`} />
                                            <span className={`text-[12px] font-medium lowercase tracking-wide ${!isFinished ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                                                {!isFinished ? 'en curso' : 'finalizado'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] text-[#9CA3AF]/60 font-medium tracking-wide">
                                            {new Date(entry.createdAt).toLocaleString('es-ES', { 
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            }).replace(',', ' •')}
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
