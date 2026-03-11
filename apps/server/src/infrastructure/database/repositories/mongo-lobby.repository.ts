import { LobbyRepository } from '../../../domain/repositories/lobby.repository';
import { Lobby } from '../../../domain/entities/lobby.entity';
import { LobbyModel } from '../models/lobby.model';

export class MongoLobbyRepository implements LobbyRepository {
    async create(lobby: Omit<Lobby, 'id'>): Promise<Lobby> {
        const created = await LobbyModel.create(lobby);
        return this.mapToEntity(created);
    }

    async findById(id: string): Promise<Lobby | null> {
        const doc = await LobbyModel.findById(id);
        if (!doc) return null;
        return this.mapToEntity(doc);
    }

    async findWaitingLobby(): Promise<Lobby | null> {
        // Find a lobby that is 'waiting' and has less than 2 players
        const doc = await LobbyModel.findOne({
            status: 'waiting',
            $expr: { $lt: [{ $size: "$players" }, 2] }
        });
        if (!doc) return null;
        return this.mapToEntity(doc);
    }

    async findByPlayerId(playerId: string): Promise<Lobby | null> {
        const doc = await LobbyModel.findOne({ players: playerId });
        if (!doc) return null;
        return this.mapToEntity(doc);
    }

    async update(id: string, updates: Partial<Lobby>): Promise<Lobby | null> {
        const updated = await LobbyModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) return null;
        return this.mapToEntity(updated);
    }

    async transitionStatus(id: string, notInStatus: string, newStatus: string): Promise<Lobby | null> {
        const updated = await LobbyModel.findOneAndUpdate(
            { _id: id, status: { $ne: notInStatus } },
            { $set: { status: newStatus } },
            { new: true }
        );
        if (!updated) return null;
        return this.mapToEntity(updated);
    }

    private mapToEntity(doc: any): Lobby {
        return {
            id: doc._id.toString(),
            status: doc.status,
            players: doc.players,
            createdAt: doc.createdAt
        };
    }
}
