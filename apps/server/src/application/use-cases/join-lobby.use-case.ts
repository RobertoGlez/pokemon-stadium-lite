import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { PlayerRepository } from '../../domain/repositories/player.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player } from '../../domain/entities/player.entity';

export class JoinLobbyUseCase {
    constructor(
        private readonly lobbyRepository: LobbyRepository,
        private readonly playerRepository: PlayerRepository
    ) { }

    async execute(nickname: string, socketId: string): Promise<{ lobby: Lobby; player: Player }> {
        // 1. Create the Player
        let player = await this.playerRepository.create({
            nickname,
            socketId,
            joinedLobbyAt: new Date()
        });

        // The created player should have an ID assigned by the database
        if (!player.id) {
            throw new Error('Failed to create player: no ID assigned');
        }

        // 2. Find a waiting lobby
        let lobby = await this.lobbyRepository.findWaitingLobby();

        if (lobby) {
            // Lobby exists, add player
            lobby.players.push(player.id);

            // If the lobby now has 2 players, we could optionally change its status
            // However, business rules say: waiting = 2 players logged in, pending "ready"
            // So status remains 'waiting' until they are both ready.

            const updatedLobby = await this.lobbyRepository.update(lobby.id!, {
                players: lobby.players
            });

            return { lobby: updatedLobby!, player };
        } else {
            // 3. Create a new lobby
            const newLobby: Omit<Lobby, 'id'> = {
                status: 'waiting',
                players: [player.id],
                createdAt: new Date()
            };

            const createdLobby = await this.lobbyRepository.create(newLobby);

            return { lobby: createdLobby, player };
        }
    }
}
