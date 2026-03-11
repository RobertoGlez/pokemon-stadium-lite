import { BattleRepository } from '../../domain/repositories/battle.repository';
import { PlayerRepository } from '../../domain/repositories/player.repository';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';

export interface GlobalHistoryEntry {
    id: string;
    player1: string;
    player2: string;
    p1Team: { name: string, spriteUrl: string, isDefeated: boolean }[];
    p2Team: { name: string, spriteUrl: string, isDefeated: boolean }[];
    status: 'in_progress' | 'finished';
    winnerName?: string;
    createdAt: Date;
}

export class GetGlobalHistoryUseCase {
    constructor(
        private readonly battleRepository: BattleRepository,
        private readonly playerRepository: PlayerRepository,
        private readonly lobbyRepository: LobbyRepository
    ) { }

    async execute(): Promise<GlobalHistoryEntry[]> {
        const battles = await this.battleRepository.findAll();
        const history: GlobalHistoryEntry[] = [];

        // In a real production app, you would optimize this with DB aggregation ($lookup).
        // Since this is a small-scale app and for demo purposes, mapping in memory is fine.
        for (const battle of battles) {
            if (!battle.id || !battle.lobbyId) continue;

            // Determine if the battle is finished or in progress
            let status: 'in_progress' | 'finished';
            
            if (battle.winnerId) {
                status = 'finished';
            } else {
                // If not finished, check if it's actively battling in its lobby
                const lobby = await this.lobbyRepository.findById(battle.lobbyId);
                if (lobby && lobby.status === 'battling') {
                    status = 'in_progress';
                } else {
                    // It's neither finished nor actively battling (e.g. abandoned), so we skip it
                    continue;
                }
            }

            let playerIds: string[] = [];
            if (battle.teams instanceof Map) {
                playerIds = Array.from(battle.teams.keys());
            } else if (battle.teams && typeof (battle.teams as any).keys === 'function') {
                // Mongoose Types.Map
                playerIds = Array.from((battle.teams as any).keys());
            } else if (typeof battle.teams === 'object' && battle.teams !== null) {
                // Plain old javascript object
                playerIds = Object.keys(battle.teams);
            }

            if (playerIds.length < 2) continue;

            const p1 = await this.playerRepository.findById(playerIds[0]);
            const p2 = await this.playerRepository.findById(playerIds[1]);

            let winnerName: string | undefined;
            if (status === 'finished' && battle.winnerId) {
                const winner = await this.playerRepository.findById(battle.winnerId);
                winnerName = winner?.nickname;
            }

            // Map teams
            const p1Team = p1?.team?.map(p => ({ name: p.name, spriteUrl: p.spriteUrl, isDefeated: !!p.isDefeated })) || [];
            const p2Team = p2?.team?.map(p => ({ name: p.name, spriteUrl: p.spriteUrl, isDefeated: !!p.isDefeated })) || [];

            // Extract a rudimentary timestamp: If the battle has logs, use the first log timestamp.
            // Otherwise, fallback to now (Mongo ObjectIds can also provide creation time, but this is explicit)
            const createdAt = (battle.battleLog && battle.battleLog.length > 0)
                ? battle.battleLog[0].timestamp
                : new Date();

            history.push({
                id: battle.id,
                player1: p1?.nickname || 'Desconocido',
                player2: p2?.nickname || 'Desconocido',
                p1Team,
                p2Team,
                status,
                winnerName,
                createdAt
            });
        }

        return history;
    }
}
