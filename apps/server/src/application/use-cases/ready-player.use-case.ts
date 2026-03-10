import { PlayerRepository } from '../../domain/repositories/player.repository';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { BattleRepository } from '../../domain/repositories/battle.repository';
import { BattleState } from '../../domain/entities/battle.entity';
import { PokemonBase } from '../../domain/entities/pokemon.entity';
import { PlayerModel } from '../../infrastructure/database/models/player.model';
import { LobbyModel } from '../../infrastructure/database/models/lobby.model';

export class ReadyPlayerUseCase {
    constructor(
        private readonly playerRepository: PlayerRepository,
        private readonly lobbyRepository: LobbyRepository,
        private readonly battleRepository: BattleRepository
    ) { }

    async execute(socketId: string): Promise<{ battleStarted: boolean, battleState?: BattleState }> {
        // 1. Mark player as ready ATOMICALLY
        const player = await PlayerModel.findOneAndUpdate(
            { socketId },
            { $set: { isReady: true } },
            { new: true }
        );

        if (!player) {
            throw new Error('Player not found or missing ID');
        }

        // 2. Find lobby
        const lobby = await LobbyModel.findOne({ players: player._id.toString() });
        if (!lobby) {
            throw new Error('Lobby not found for player');
        }

        // If not exactly 2 players, logic cannot proceed to battle
        if (lobby.players.length !== 2) {
            return { battleStarted: false };
        }

        // 3. Inspect if both players are ready
        const p1 = await PlayerModel.findById(lobby.players[0]);
        const p2 = await PlayerModel.findById(lobby.players[1]);

        if (!p1 || !p2) {
            throw new Error('Could not fetch both players in lobby');
        }

        if (p1.isReady && p2.isReady) {
            // ATOMIC CHECK: Attempt to transition lobby from 'waiting' or 'ready' to 'battling'
            // This ensures only ONE of the two concurrent requests actually creates the battle
            const updatedLobby = await LobbyModel.findOneAndUpdate(
                { _id: lobby._id, status: { $ne: 'battling' } },
                { $set: { status: 'battling' } },
                { new: true }
            );

            // If updatedLobby is null, it means the OTHER request already set it to 'battling'
            if (!updatedLobby) {
                // The other concurrent request handles the battle creation and broadcast
                return { battleStarted: false };
            }

            // --- We are the FIRST request to set it to 'battling'. We create the battle. ---

            // Ensure teams are valid
            if (!p1.team || p1.team.length === 0 || !p2.team || p2.team.length === 0) {
                throw new Error('Players are ready but missing teams');
            }

            // Determine first turn: compare speed of Pokemon[0]
            const p1Speed = p1.team[0].stats.speed;
            const p2Speed = p2.team[0].stats.speed;

            // In case of a tie, default to player 1
            const currentTurnPlayerId = p1Speed >= p2Speed ? p1._id.toString() : p2._id.toString();

            // Assemble BattleState
            const newBattle: Omit<BattleState, 'id'> = {
                lobbyId: lobby._id.toString(),
                teams: new Map<string, PokemonBase[]>([
                    [p1._id.toString(), p1.team as unknown as PokemonBase[]],
                    [p2._id.toString(), p2.team as unknown as PokemonBase[]]
                ]),
                activePokemonIndex: new Map<string, number>([
                    [p1._id.toString(), 0],
                    [p2._id.toString(), 0]
                ]),
                currentTurnPlayerId,
                winnerId: null,
                battleLog: [{
                    id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
                    type: 'info',
                    message: `¡La batalla ha comenzado!`,
                    timestamp: new Date()
                }]
            };

            const battle = await this.battleRepository.create(newBattle);
            return { battleStarted: true, battleState: battle };
        }

        return { battleStarted: false };
    }
}
