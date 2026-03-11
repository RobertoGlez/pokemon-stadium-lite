import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { PlayerRepository } from '../../domain/repositories/player.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player, PlayerSession } from '../../domain/entities/player.entity';

export class JoinLobbyUseCase {
    constructor(
        private readonly lobbyRepository: LobbyRepository,
        private readonly playerRepository: PlayerRepository
    ) { }

    async execute(nickname: string, socketId: string, sessionData?: PlayerSession): Promise<{ lobby: Lobby; player: Player }> {
        // 1. Check for existing player by nickname
        let player = await this.playerRepository.findByNickname(nickname);

        if (player && player.id) {
            // Returning player: first remove from any existing lobby to prevent stale memberships
            const existingLobby = await this.lobbyRepository.findByPlayerId(player.id);
            if (existingLobby && existingLobby.id) {
                const remainingPlayers = existingLobby.players.filter(pId => pId !== player!.id);
                // Only update waiting lobbies — don't touch battling/finished ones to avoid duplicate key errors
                if (existingLobby.status === 'waiting') {
                    await this.lobbyRepository.update(existingLobby.id, {
                        players: remainingPlayers
                    });
                    console.log(`[JoinLobby] Removed returning player ${nickname} from stale lobby ${existingLobby.id}`);
                }
            }

            // Sync/Update existing player state for the new session
            const updatedSessions = player.sessions ? [...player.sessions] : [];
            if (sessionData) {
                updatedSessions.push(sessionData);
            }

            player = await this.playerRepository.update(player.id, {
                socketId,
                isOnline: true,
                isReady: false,
                joinedLobbyAt: new Date(),
                sessions: updatedSessions
            }) as Player;
        } else {
            // Create new player record
            const sessions = sessionData ? [sessionData] : [];
            player = await this.playerRepository.create({
                nickname,
                socketId,
                joinedLobbyAt: new Date(),
                createdAt: new Date(),
                isOnline: true,
                isReady: false,
                sessions
            });
        }

        // The created player should have an ID assigned by the database
        if (!player.id) {
            throw new Error('Failed to create player: no ID assigned');
        }

        // 2. Find a waiting lobby (now safe — player is not in any lobby)
        let lobby = await this.lobbyRepository.findWaitingLobby();

        if (lobby) {
            // Lobby exists, add player
            lobby.players.push(player.id);

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
