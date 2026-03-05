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
    connectAndJoin: (nickname: string) => void;
    disconnect: () => void;
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

    const socketRef = useRef<Socket | null>(null);

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
        connectAndJoin,
        disconnect
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
