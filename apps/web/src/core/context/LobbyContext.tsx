import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, LobbyStatusPayload, BattleLogEntry } from '../types/models';

interface LobbyContextValue {
    socket: Socket | null;
    isConnected: boolean;
    localNickname: string;
    lobbyStatus: 'waiting' | 'ready' | 'battling' | 'finished' | 'idle';
    players: Player[];
    requestTeam: () => void;
    emitReady: () => void;
    emitAttack: () => void;
    connectAndJoin: (nickname: string, serverUrl?: string) => void;
    disconnect: () => void;
    currentTurnPlayerId: string | null;
    lastDamageEvent: { defenderId: string; damage: number; timestamp: number } | null;
    isRequestingTeam: boolean;
    joinError: string | null;
    clearJoinError: () => void;
    battleLog: BattleLogEntry[];
    winnerId: string | null;
}

const LobbyContext = createContext<LobbyContextValue | undefined>(undefined);

const getBackendUrl = () => {
    return localStorage.getItem('backendUrl') || import.meta.env.VITE_API_BACKEND || 'http://localhost:8080';
};

export const LobbyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [localNickname, setLocalNickname] = useState('');
    const [lobbyStatus, setLobbyStatus] = useState<'waiting' | 'ready' | 'battling' | 'finished' | 'idle'>('idle');
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
    const [lastDamageEvent, setLastDamageEvent] = useState<{ defenderId: string; damage: number; timestamp: number } | null>(null);
    const [isRequestingTeam, setIsRequestingTeam] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
    const [winnerId, setWinnerId] = useState<string | null>(null);

    const clearJoinError = () => setJoinError(null);

    const appendLog = (type: BattleLogEntry['type'], message: string) => {
        setBattleLog(prev => [...prev, {
            id: Math.random().toString(36).substring(2, 9),
            type,
            message,
            timestamp: Date.now()
        }]);
    };

    const localNicknameRef = useRef<string>('');

    const socketRef = useRef<Socket | null>(null);
    const turnPlayerIdRef = useRef<string | null>(null);
    const playersRef = useRef<Player[]>([]);

    // Keep ref in sync for closure access in socket listeners
    useEffect(() => {
        turnPlayerIdRef.current = currentTurnPlayerId;
    }, [currentTurnPlayerId]);

    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    const requestTeam = () => {
        if (socketRef.current) {
            setIsRequestingTeam(true);
            socketRef.current.emit('assign_pokemon');
        }
    };

    const emitReady = () => {
        if (socketRef.current) {
            socketRef.current.emit('ready');
        }
    };

    const emitAttack = () => {
        if (socketRef.current) {
            socketRef.current.emit('attack');
        }
    };

    const connectAndJoin = (nickname: string, serverUrl?: string) => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        // Use the provided URL, or fall back to localStorage, or default
        const socketUrl = serverUrl || getBackendUrl();

        // Save the URL in use so future calls are consistent
        if (serverUrl) {
            localStorage.setItem('backendUrl', serverUrl);
        }

        const newSocket = io(socketUrl, {
            // Updated for Cloud Run which natively supports WebSockets
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 15000,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            setLocalNickname(nickname);
            localNicknameRef.current = nickname;
            newSocket.emit('join_lobby', nickname);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setLobbyStatus('idle');
            setPlayers([]);
        });

        newSocket.on('lobby_status', (data: LobbyStatusPayload) => {
            setLobbyStatus(data.status);
            const incomingPlayers = data.players || [];
            setPlayers(incomingPlayers);
            // Clear loading state once local player's team is defined
            const localPlayer = incomingPlayers.find(
                (p: any) => p.nickname === localNicknameRef.current
            );
            if (localPlayer?.team && localPlayer.team.length > 0) {
                setIsRequestingTeam(false);
            }
        });

        newSocket.on('battle_start', (data: { currentTurnPlayerId: string }) => {
            setLobbyStatus('battling'); // Ensure state reflects battle locally
            setCurrentTurnPlayerId(data.currentTurnPlayerId);
            appendLog('info', '¡La batalla ha comenzado!');
        });

        newSocket.on('turn_result', (data: any) => {
            if (data.damage && data.defenderId) {
                const currentPlayers = playersRef.current;
                const attacker = currentPlayers.find(p => p.id === data.attackerId);
                const defender = currentPlayers.find(p => p.id === data.defenderId);
                const attackerActive = attacker?.team?.find(p => !p.isDefeated);
                const defenderActive = defender?.team?.find(p => !p.isDefeated);

                if (attackerActive && defenderActive) {
                    appendLog('damage', `${attackerActive.name} atacó a ${defenderActive.name} por ${data.damage} de daño.`);
                }

                setLastDamageEvent({
                    defenderId: data.defenderId,
                    damage: data.damage,
                    timestamp: Date.now() // to trigger effect even if same damage is repeated
                });

                if (data.pokemonFainted && defenderActive) {
                    appendLog('defeat', `¡${defenderActive.name} fue derrotado!`);
                    if (data.nextDefenderPokemon) {
                        appendLog('switch', `${defender?.nickname} envía a ${data.nextDefenderPokemon.name}.`);
                    }
                }
            }

            setPlayers(prevPlayers => prevPlayers.map(p => {
                // If this player is explicitly the defender receiving damage
                if (p.id === data.defenderId) {
                    const newTeam = [...(p.team || [])];
                    const activeIdx = newTeam.findIndex(poke => !poke.isDefeated);
                    if (activeIdx !== -1) {
                        const updatedPoke = { ...newTeam[activeIdx] };
                        updatedPoke.stats = { ...updatedPoke.stats, currentHp: data.remainingHp };
                        newTeam[activeIdx] = updatedPoke;
                    }
                    return { ...p, team: newTeam };
                }
                return p;
            }));

            if (data.isDefeated) {
                setTimeout(() => {
                    setPlayers(prevPlayers => prevPlayers.map(p => {
                        if (p.id === data.defenderId) {
                            const newTeam = [...(p.team || [])];
                            const activeIdx = newTeam.findIndex(poke => !poke.isDefeated);
                            if (activeIdx !== -1 && newTeam[activeIdx].stats.currentHp === 0) {
                                const updatedPoke = { ...newTeam[activeIdx] };
                                updatedPoke.isDefeated = true;
                                newTeam[activeIdx] = updatedPoke;
                            }
                            return { ...p, team: newTeam };
                        }
                        return p;
                    }));
                }, 1200);
            }

            if (!data.matchFinished) {
                if (data.isDefeated) {
                    setTimeout(() => {
                        setCurrentTurnPlayerId(data.nextTurnPlayerId);
                    }, 1200);
                } else {
                    setCurrentTurnPlayerId(data.nextTurnPlayerId);
                }
            }
        });

        newSocket.on('battle_end', (data: any) => {
            setTimeout(() => {
                setLobbyStatus('finished');
                setCurrentTurnPlayerId(null);
                if (data?.winnerId) {
                    setWinnerId(data.winnerId);
                }
                if (data?.winnerName) {
                    appendLog('winner', `¡${data.winnerName} ha ganado la batalla!`);
                }
            }, 1200);
        });

        newSocket.on('join_error', (data: { code: string; message: string }) => {
            setJoinError(data.message);
            // Disconnect: nickname conflict means we shouldn't stay connected
            newSocket.disconnect();
            setIsConnected(false);
            setLocalNickname('');
            socketRef.current = null;
            setSocket(null);
        });

        setSocket(newSocket);
        socketRef.current = newSocket;
    };

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        setSocket(null);
        socketRef.current = null;
        setIsConnected(false);
        setLobbyStatus('idle');
        setPlayers([]);
        setLocalNickname('');
        setCurrentTurnPlayerId(null);
        setBattleLog([]);
        setWinnerId(null);
    };

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const value: LobbyContextValue = {
        socket,
        isConnected,
        localNickname,
        lobbyStatus,
        players,
        requestTeam,
        emitReady,
        emitAttack,
        connectAndJoin,
        disconnect,
        currentTurnPlayerId,
        lastDamageEvent,
        isRequestingTeam,
        joinError,
        clearJoinError,
        battleLog,
        winnerId
    };

    return (
        <LobbyContext.Provider value={value}>
            {children}
        </LobbyContext.Provider>
    );
};

export const useLobby = () => {
    const context = useContext(LobbyContext);
    if (context === undefined) {
        throw new Error('useLobby must be used within a LobbyProvider');
    }
    return context;
};
