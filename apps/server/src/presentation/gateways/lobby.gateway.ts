import { Server, Socket } from 'socket.io';
import { JoinLobbyUseCase } from '../../application/use-cases/join-lobby.use-case';
import { AssignPokemonUseCase } from '../../application/use-cases/assign-pokemon.use-case';
import { MongoLobbyRepository } from '../../infrastructure/database/repositories/mongo-lobby.repository';
import { MongoPlayerRepository } from '../../infrastructure/database/repositories/mongo-player.repository';
import { PokemonApiAdapter } from '../../infrastructure/http/adapters/pokemon-api.adapter';

export const initializeLobbyGateway = (io: Server) => {
    // Instantiate use case dependencies locally
    const lobbyRepo = new MongoLobbyRepository();
    const playerRepo = new MongoPlayerRepository();
    const pokemonApiAdapter = new PokemonApiAdapter();
    const joinLobbyUseCase = new JoinLobbyUseCase(lobbyRepo, playerRepo);
    const assignPokemonUseCase = new AssignPokemonUseCase(playerRepo, lobbyRepo, pokemonApiAdapter);

    const broadcastLobbyStatus = async (lobbyId: string) => {
        const lobby = await lobbyRepo.findById(lobbyId);
        if (!lobby) return;

        const playersData = [];
        for (const playerId of lobby.players) {
            const p = await playerRepo.findById(playerId);
            if (p) {
                playersData.push({
                    nickname: p.nickname,
                    team: p.team ? p.team.map(poke => poke.name) : []
                });
            }
        }

        const lobbyStatusResponse = {
            status: lobby.status,
            players: playersData
        };

        io.to(lobbyId).emit('lobby_status', lobbyStatusResponse);
        console.log(`[Socket] Emitted lobby_status to room ${lobbyId}:`, JSON.stringify(lobbyStatusResponse));
    };

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] New connection: ${socket.id}`);

        socket.on('join_lobby', async (nickname: string) => {
            try {
                if (!nickname || nickname.trim() === '') {
                    console.log(`[Socket] join_lobby without nickname from ${socket.id}`);
                    return;
                }

                console.log(`[Socket] Player ${nickname} joining lobby...`);

                const { lobby } = await joinLobbyUseCase.execute(nickname, socket.id);
                socket.join(lobby.id!);

                await broadcastLobbyStatus(lobby.id!);
            } catch (error) {
                console.error(`[Socket] Error in join_lobby:`, error);
            }
        });

        socket.on('assign_pokemon', async () => {
            try {
                console.log(`[Socket] assign_pokemon requested by ${socket.id}`);
                const player = await assignPokemonUseCase.execute(socket.id);

                const lobby = await lobbyRepo.findByPlayerId(player.id!);
                if (lobby) {
                    await broadcastLobbyStatus(lobby.id!);
                }
            } catch (error) {
                console.error(`[Socket] Error in assign_pokemon:`, error);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
            await playerRepo.deleteBySocketId(socket.id);
        });
    });
};
