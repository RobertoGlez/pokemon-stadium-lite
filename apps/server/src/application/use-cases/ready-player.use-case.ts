import { PlayerRepository } from '../../domain/repositories/player.repository';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { BattleRepository } from '../../domain/repositories/battle.repository';
import { BattleState } from '../../domain/entities/battle.entity';
import { PokemonBase } from '../../domain/entities/pokemon.entity';

export class ReadyPlayerUseCase {
    constructor(
        private readonly playerRepository: PlayerRepository,
        private readonly lobbyRepository: LobbyRepository,
        private readonly battleRepository: BattleRepository
    ) { }

    async execute(socketId: string): Promise<{ battleStarted: boolean, battleState?: BattleState }> {
        // 1. Mark player as ready
        const player = await this.playerRepository.findBySocketId(socketId);
        if (!player || !player.id) {
            throw new Error('Player not found or missing ID');
        }

        player.isReady = true;
        await this.playerRepository.update(player.id, { isReady: true });

        // 2. Check lobby
        const lobby = await this.lobbyRepository.findByPlayerId(player.id);
        if (!lobby || !lobby.id) {
            throw new Error('Lobby not found for player');
        }

        // If not exactly 2 players, logic cannot proceed to battle
        if (lobby.players.length !== 2) {
            return { battleStarted: false };
        }

        // 3. Inspect if both players are ready
        const player1 = await this.playerRepository.findById(lobby.players[0]);
        const player2 = await this.playerRepository.findById(lobby.players[1]);

        if (!player1 || !player2) {
            throw new Error('Could not fetch both players in lobby');
        }

        if (player1.isReady && player2.isReady) {
            // Both are ready, start battle
            await this.lobbyRepository.update(lobby.id, { status: 'battling' });

            // Ensure teams are valid
            if (!player1.team || player1.team.length === 0 || !player2.team || player2.team.length === 0) {
                throw new Error('Players are ready but missing teams');
            }

            // Check if a battle was already created by the other player's concurrent ready request
            let battle = await this.battleRepository.findByLobbyId(lobby.id);

            if (!battle) {
                // Determine first turn: compare speed of Pokemon[0]
                const p1Speed = player1.team[0].stats.speed;
                const p2Speed = player2.team[0].stats.speed;

                // In case of a tie, default to player 1
                const currentTurnPlayerId = p1Speed >= p2Speed ? player1.id! : player2.id!;

                // Assemble BattleState
                const newBattle: Omit<BattleState, 'id'> = {
                    lobbyId: lobby.id,
                    teams: new Map<string, PokemonBase[]>([
                        [player1.id!, player1.team],
                        [player2.id!, player2.team]
                    ]),
                    activePokemonIndex: new Map<string, number>([
                        [player1.id!, 0],
                        [player2.id!, 0]
                    ]),
                    currentTurnPlayerId,
                    winnerId: null
                };

                try {
                    battle = await this.battleRepository.create(newBattle);
                } catch (error: any) {
                    if (error.code === 11000 || (error?.message?.includes('11000'))) {
                        const existingBattle = await this.battleRepository.findByLobbyId(lobby.id);
                        if (!existingBattle) throw new Error('E11000 but cannot find battle');
                        battle = existingBattle;
                    } else {
                        throw error;
                    }
                }
            }

            return { battleStarted: true, battleState: battle };
        }

        return { battleStarted: false };
    }
}
