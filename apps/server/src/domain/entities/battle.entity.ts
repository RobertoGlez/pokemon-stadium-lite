import { PokemonBase } from './pokemon.entity';

export interface BattleLogEntry {
    id: string;
    type: 'info' | 'damage' | 'defeat' | 'switch' | 'winner';
    message: string;
    timestamp: Date;
}

export interface BattleState {
    id?: string;
    lobbyId: string;
    teams: Map<string, PokemonBase[]>;
    activePokemonIndex: Map<string, number>;
    currentTurnPlayerId: string | null;
    winnerId: string | null;
    battleLog: BattleLogEntry[];
}
