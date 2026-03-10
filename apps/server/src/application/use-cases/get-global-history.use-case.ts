import { BattleRepository } from '../../domain/repositories/battle.repository';
import { PlayerRepository } from '../../domain/repositories/player.repository';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';

export interface GlobalHistoryEntry {
    id: string;
    player1: string;
    player2: string;
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

            // Find the underlying lobby to see if it's currently battling or finished
            const lobby = await this.lobbyRepository.findById(battle.lobbyId);
            if (!lobby) continue;

            // Only show battles that are actually in progress or have finished
            if (lobby.status !== 'battling' && lobby.status !== 'finished') {
                continue;
            }

            const status = lobby.status === 'battling' ? 'in_progress' : 'finished';

            const playerIds = Array.from(battle.teams.keys());
            if (playerIds.length < 2) continue;

            const p1 = await this.playerRepository.findById(playerIds[0]);
            const p2 = await this.playerRepository.findById(playerIds[1]);

            let winnerName: string | undefined;
            if (status === 'finished' && battle.winnerId) {
                const winner = await this.playerRepository.findById(battle.winnerId);
                winnerName = winner?.nickname;
            }

            // Extract a rudimentary timestamp: If the battle has logs, use the first log timestamp.
            // Otherwise, fallback to now (Mongo ObjectIds can also provide creation time, but this is explicit)
            const createdAt = (battle.battleLog && battle.battleLog.length > 0)
                ? battle.battleLog[0].timestamp
                : new Date();

            history.push({
                id: battle.id,
                player1: p1?.nickname || 'Desconocido',
                player2: p2?.nickname || 'Desconocido',
                status,
                winnerName,
                createdAt
            });
        }

        return history;
    }
}
