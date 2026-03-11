import { PokemonBase } from './pokemon.entity';

export interface PlayerSession {
    userAgent: string;
    parsedInfo?: string;
    timestamp: Date;
    isMobile?: boolean;
    deviceType?: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    ip?: string;
}

export interface Player {
    id?: string;
    nickname: string;
    socketId: string;
    joinedLobbyAt: Date;
    createdAt?: Date;
    sessions?: PlayerSession[];
    team?: PokemonBase[];
    isReady?: boolean;
    isOnline?: boolean;
}
