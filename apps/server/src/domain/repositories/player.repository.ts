import { Player } from '../entities/player.entity';

export interface PlayerRepository {
    create(player: Omit<Player, 'id'>): Promise<Player>;
    findById(id: string): Promise<Player | null>;
    findBySocketId(socketId: string): Promise<Player | null>;
    findByNickname(nickname: string): Promise<Player | null>;
    update(id: string, updates: Partial<Player>): Promise<Player | null>;
    deleteBySocketId(socketId: string): Promise<void>;
}
