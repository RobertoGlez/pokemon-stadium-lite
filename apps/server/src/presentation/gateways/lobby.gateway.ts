import { Server, Socket } from 'socket.io';
import { JoinLobbyUseCase } from '../../application/use-cases/join-lobby.use-case';
import { MongoLobbyRepository } from '../../infrastructure/database/repositories/mongo-lobby.repository';
import { MongoPlayerRepository } from '../../infrastructure/database/repositories/mongo-player.repository';

export const initializeLobbyGateway = (io: Server) => {
    // Instantiate use case dependencies locally
    const lobbyRepo = new MongoLobbyRepository();
    const playerRepo = new MongoPlayerRepository();
    const joinLobbyUseCase = new JoinLobbyUseCase(lobbyRepo, playerRepo);

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] New connection: ${socket.id}`);

        socket.on('join_lobby', async (nickname: string) => {
            try {
                if (!nickname || nickname.trim() === '') {
                    // Send error or ignore
                    console.log(`[Socket] join_lobby without nickname from ${socket.id}`);
                    return;
                }

                console.log(`[Socket] Player ${nickname} joining lobby...`);

                const { lobby, player } = await joinLobbyUseCase.execute(nickname, socket.id);

                // Join the Socket.IO room named after the lobby's ID
                socket.join(lobby.id!);

                // According to B-US-03, we need to return status: waiting and the array of players containing our name.
                // Note: lobby.players currently holds UUIDs. But business requirements just state "array of players conteniendo nuestro nombre".
                // We should probably map players to their nicknames.
                // Let's resolve the player nicknames
                const playerNicknames: string[] = [];
                for (const playerId of lobby.players) {
                    const p = await playerRepo.findById(playerId);
                    if (p) {
                        playerNicknames.push(p.nickname);
                    }
                }

                const lobbyStatusResponse = {
                    status: lobby.status,
                    players: playerNicknames
                };

                // Broadcast to all clients in the room
                io.to(lobby.id!).emit('lobby_status', lobbyStatusResponse);

                console.log(`[Socket] Emitted lobby_status to room ${lobby.id!}:`, lobbyStatusResponse);
            } catch (error) {
                console.error(`[Socket] Error in join_lobby:`, error);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
            // Later we should handle player leaving lobby, etc. Not covered in B-US-03.
            await playerRepo.deleteBySocketId(socket.id);
        });
    });
};
