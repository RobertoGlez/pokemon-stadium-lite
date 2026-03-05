export interface PokemonStats {
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    speed: number;
}

export interface PokemonBase {
    id: number;
    name: string;
    types: string[];
    stats: PokemonStats;
    spriteUrl: string;
    isDefeated?: boolean;
}

export interface Player {
    id: string;
    nickname: string;
    socketId: string;
    joinedLobbyAt: Date | string;
    team?: PokemonBase[];
    isReady?: boolean;
}

export interface LobbyStatusPayload {
    id: string;
    status: 'waiting' | 'ready' | 'battling' | 'finished';
    players: Player[];
}

export interface BattleLogEntry {
    id: string;
    type: 'info' | 'damage' | 'defeat' | 'switch' | 'winner';
    message: string;
    timestamp: number;
}
