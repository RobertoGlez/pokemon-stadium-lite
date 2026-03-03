import { PokemonBase } from './pokemon.entity';

export interface Player {
    id?: string; // Optional for new players before persistence
    nickname: string;
    socketId: string;
    joinedLobbyAt: Date;
    team?: PokemonBase[]; // Team assigned to the player
}
