import { BattleRepository } from '../../../domain/repositories/battle.repository';
import { BattleState } from '../../../domain/entities/battle.entity';
import { BattleModel } from '../models/battle.model';

export class MongoBattleRepository implements BattleRepository {
    async create(battleState: Omit<BattleState, 'id'>): Promise<BattleState> {
        const created = await BattleModel.create(battleState);
        return this.mapToEntity(created);
    }

    async findByLobbyId(lobbyId: string): Promise<BattleState | null> {
        const doc = await BattleModel.findOne({ lobbyId });
        if (!doc) return null;
        return this.mapToEntity(doc);
    }

    async update(id: string, updates: Partial<BattleState>): Promise<BattleState | null> {
        const updated = await BattleModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) return null;
        return this.mapToEntity(updated);
    }

    private mapToEntity(doc: any): BattleState {
        return {
            id: doc._id.toString(),
            lobbyId: doc.lobbyId,
            teams: doc.teams,
            activePokemonIndex: doc.activePokemonIndex,
            currentTurnPlayerId: doc.currentTurnPlayerId,
            winnerId: doc.winnerId
        };
    }
}
