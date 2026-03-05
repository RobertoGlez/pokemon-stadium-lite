import { PokemonBase } from './pokemon.entity';

export interface Player {
    id?: string;
    nickname: string;
    socketId: string;
    joinedLobbyAt: Date;
    createdAt?: Date;
    team?: PokemonBase[];
    isReady?: boolean;
    isOnline?: boolean;
}
