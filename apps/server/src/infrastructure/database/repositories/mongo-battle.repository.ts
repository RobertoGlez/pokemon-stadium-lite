import { BattleRepository } from '../../../domain/repositories/battle.repository';
import { BattleState } from '../../../domain/entities/battle.entity';
import { BattleModel } from '../models/battle.model';

export class MongoBattleRepository implements BattleRepository {
    async create(battleState: Omit<BattleState, 'id'>): Promise<BattleState> {
        const createDoc: any = { ...battleState };
        if (battleState.teams instanceof Map) {
            createDoc.teams = Object.fromEntries(battleState.teams);
        }
        if (battleState.activePokemonIndex instanceof Map) {
            createDoc.activePokemonIndex = Object.fromEntries(battleState.activePokemonIndex);
        }
        const created = await BattleModel.create(createDoc);
        return this.mapToEntity(created);
    }

    async findByLobbyId(lobbyId: string): Promise<BattleState | null> {
        const doc = await BattleModel.findOne({ lobbyId });
        if (!doc) return null;
        return this.mapToEntity(doc);
    }

    async update(id: string, updates: Partial<BattleState>): Promise<BattleState | null> {
        // Mongoose requires Map types to be plain objects when using $set, or we can use the document .set() method
        // But since we use findByIdAndUpdate, we should convert ES6 Maps to objects for Mongoose to handle them smoothly
        const updateDoc: any = { ...updates };

        if (updates.teams instanceof Map) {
            updateDoc.teams = Object.fromEntries(updates.teams);
        }
        if (updates.activePokemonIndex instanceof Map) {
            updateDoc.activePokemonIndex = Object.fromEntries(updates.activePokemonIndex);
        }

        const updated = await BattleModel.findByIdAndUpdate(id, { $set: updateDoc }, { new: true });
        if (!updated) return null;
        return this.mapToEntity(updated);
    }

    async findAll(): Promise<BattleState[]> {
        const docs = await BattleModel.find({}).sort({ _id: -1 }).limit(50); // Fetch latest 50
        return docs.map(doc => this.mapToEntity(doc));
    }

    private mapToEntity(doc: any): BattleState {
        return {
            id: doc._id.toString(),
            lobbyId: doc.lobbyId,
            teams: doc.teams,
            activePokemonIndex: doc.activePokemonIndex,
            currentTurnPlayerId: doc.currentTurnPlayerId,
            winnerId: doc.winnerId,
            battleLog: doc.battleLog || []
        };
    }
}
