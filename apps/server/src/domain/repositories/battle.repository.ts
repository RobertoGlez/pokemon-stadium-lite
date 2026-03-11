import { BattleState } from '../entities/battle.entity';

export interface BattleRepository {
    create(battleState: Omit<BattleState, 'id'>): Promise<BattleState>;
    findByLobbyId(lobbyId: string): Promise<BattleState | null>;
    update(id: string, updates: Partial<BattleState>): Promise<BattleState | null>;
    findAll(): Promise<BattleState[]>;
}
