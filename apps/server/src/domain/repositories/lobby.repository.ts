import { Lobby } from '../entities/lobby.entity';

export interface LobbyRepository {
    create(lobby: Omit<Lobby, 'id'>): Promise<Lobby>;
    findById(id: string): Promise<Lobby | null>;
    findWaitingLobby(): Promise<Lobby | null>;
    findByPlayerId(playerId: string): Promise<Lobby | null>;
    update(id: string, updates: Partial<Lobby>): Promise<Lobby | null>;
    transitionStatus(id: string, notInStatus: string, newStatus: string): Promise<Lobby | null>;
}
