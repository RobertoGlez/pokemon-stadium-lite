import { PokemonBase } from './pokemon.entity';

export interface BattleState {
    id?: string;
    lobbyId: string;
    teams: Map<string, PokemonBase[]>;
    activePokemonIndex: Map<string, number>;
    currentTurnPlayerId: string | null;
    winnerId: string | null;
}
