import { PlayerRepository } from '../../../domain/repositories/player.repository';
import { Player } from '../../../domain/entities/player.entity';
import { PlayerModel } from '../models/player.model';

export class MongoPlayerRepository implements PlayerRepository {
    async create(player: Omit<Player, 'id'>): Promise<Player> {
        const created = await PlayerModel.create(player);
        return this.mapToEntity(created);
    }

    async findById(id: string): Promise<Player | null> {
        const doc = await PlayerModel.findById(id);
        if (!doc) return null;
        return this.mapToEntity(doc);
    }

    async findBySocketId(socketId: string): Promise<Player | null> {
        const doc = await PlayerModel.findOne({ socketId });
        if (!doc) return null;
        return this.mapToEntity(doc);
    }

    async update(id: string, updates: Partial<Player>): Promise<Player | null> {
        const updated = await PlayerModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) return null;
        return this.mapToEntity(updated);
    }

    async deleteBySocketId(socketId: string): Promise<void> {
        await PlayerModel.deleteOne({ socketId });
    }

    private mapToEntity(doc: any): Player {
        return {
            id: doc._id.toString(),
            nickname: doc.nickname,
            socketId: doc.socketId,
            joinedLobbyAt: doc.joinedLobbyAt,
            team: doc.team || [],
            isReady: doc.isReady || false
        };
    }
}
