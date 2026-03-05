import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, LobbyStatusPayload } from '../types/models';

interface LobbyContextValue {
    socket: Socket | null;
    isConnected: boolean;
    localNickname: string;
    lobbyStatus: 'waiting' | 'ready' | 'battling' | 'finished' | 'idle';
    players: Player[];
    requestTeam: () => void;
    emitReady: () => void;
    emitAttack: () => void;
    connectAndJoin: (nickname: string) => void;
    disconnect: () => void;
    currentTurnPlayerId: string | null;
}

const LobbyContext = createContext<LobbyContextValue | undefined>(undefined);

const getBackendUrl = () => {
    return localStorage.getItem('backendUrl') || 'http://localhost:8080';
};

export const LobbyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [localNickname, setLocalNickname] = useState('');
    const [lobbyStatus, setLobbyStatus] = useState<'waiting' | 'ready' | 'battling' | 'finished' | 'idle'>('idle');
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const turnPlayerIdRef = useRef<string | null>(null);

    // Keep ref in sync for closure access in socket listeners
    useEffect(() => {
        turnPlayerIdRef.current = currentTurnPlayerId;
    }, [currentTurnPlayerId]);

    const requestTeam = () => {
        if (socketRef.current) {
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

    const connectAndJoin = (nickname: string) => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        const socketUrl = getBackendUrl();
        const newSocket = io(socketUrl, { transports: ['websocket'] });

        newSocket.on('connect', () => {
            setIsConnected(true);
            setLocalNickname(nickname);
            newSocket.emit('join_lobby', nickname);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setLobbyStatus('idle');
            setPlayers([]);
        });

        newSocket.on('lobby_status', (data: LobbyStatusPayload) => {
            setLobbyStatus(data.status);
            setPlayers(data.players || []);
        });

        newSocket.on('battle_start', (data: { currentTurnPlayerId: string }) => {
            setLobbyStatus('battling'); // Ensure state reflects battle locally
            setCurrentTurnPlayerId(data.currentTurnPlayerId);
        });

        newSocket.on('turn_result', (data: any) => {
            setPlayers(prevPlayers => prevPlayers.map(p => {
                // If this player was NOT the attacker, they are the defender receiving damage
                if (p.id !== turnPlayerIdRef.current) {
                    const newTeam = [...(p.team || [])];
                    const activeIdx = newTeam.findIndex(poke => !poke.isDefeated);
                    if (activeIdx !== -1) {
                        const updatedPoke = { ...newTeam[activeIdx] };
                        updatedPoke.stats = { ...updatedPoke.stats, currentHp: data.remainingHp };
                        if (data.isDefeated) {
                            updatedPoke.isDefeated = true;
                        }
                        newTeam[activeIdx] = updatedPoke;
                    }
                    return { ...p, team: newTeam };
                }
                return p;
            }));

            if (!data.matchFinished) {
                setCurrentTurnPlayerId(data.nextTurnPlayerId);
            }
        });

        newSocket.on('battle_end', () => {
            setLobbyStatus('finished');
            setCurrentTurnPlayerId(null);
            // Optional: you can store the winner locally or handle routing
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
        currentTurnPlayerId
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
