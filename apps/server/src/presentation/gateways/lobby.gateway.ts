import { Server, Socket } from 'socket.io';
import { JoinLobbyUseCase } from '../../application/use-cases/join-lobby.use-case';
import { AssignPokemonUseCase } from '../../application/use-cases/assign-pokemon.use-case';
import { ReadyPlayerUseCase } from '../../application/use-cases/ready-player.use-case';
import { ProcessAttackUseCase } from '../../application/use-cases/process-attack.use-case';
import { MongoLobbyRepository } from '../../infrastructure/database/repositories/mongo-lobby.repository';
import { MongoPlayerRepository } from '../../infrastructure/database/repositories/mongo-player.repository';
import { MongoBattleRepository } from '../../infrastructure/database/repositories/mongo-battle.repository';
import { PokemonApiAdapter } from '../../infrastructure/http/adapters/pokemon-api.adapter';
import { GetGlobalHistoryUseCase } from '../../application/use-cases/get-global-history.use-case';

export const initializeLobbyGateway = (io: Server) => {
    // Instantiate use case dependencies locally
    const lobbyRepo = new MongoLobbyRepository();
    const playerRepo = new MongoPlayerRepository();
    const battleRepo = new MongoBattleRepository();
    const pokemonApiAdapter = new PokemonApiAdapter();
    const joinLobbyUseCase = new JoinLobbyUseCase(lobbyRepo, playerRepo);
    const assignPokemonUseCase = new AssignPokemonUseCase(playerRepo, lobbyRepo, pokemonApiAdapter);
    const readyPlayerUseCase = new ReadyPlayerUseCase(playerRepo, lobbyRepo, battleRepo);
    const processAttackUseCase = new ProcessAttackUseCase(playerRepo, lobbyRepo, battleRepo);
    const getGlobalHistoryUseCase = new GetGlobalHistoryUseCase(battleRepo, playerRepo, lobbyRepo);

    const broadcastGlobalHistory = async () => {
        try {
            const history = await getGlobalHistoryUseCase.execute();
            io.emit('global_history', history);
        } catch (error) {
            console.error('[Socket] Error broadcasting global history:', error);
        }
    };

    const broadcastLobbyStatus = async (lobbyId: string) => {
        const lobby = await lobbyRepo.findById(lobbyId);
        if (!lobby) return;

        const playersData = [];
        for (const playerId of lobby.players) {
            const p = await playerRepo.findById(playerId);
            if (p) {
                playersData.push({
                    id: p.id,
                    socketId: p.socketId,  // Included so clients can match turn by socketId as fallback
                    nickname: p.nickname,
                    team: p.team || [],
                    isReady: p.isReady || false,
                    joinedLobbyAt: p.joinedLobbyAt
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
            } catch (error: any) {
                if (error.message === 'NICKNAME_TAKEN') {
                    socket.emit('join_error', {
                        code: 'NICKNAME_TAKEN',
                        message: `El apodo "${nickname}" ya está en uso. Elige otro.`
                    });
                } else {
                    console.error(`[Socket] Error in join_lobby:`, error);
                }
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
            } catch (error: any) {
                console.error(`[Socket] Error in assign_pokemon:`, error);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
            try {
                const player = await playerRepo.findBySocketId(socket.id);
                if (player && player.id) {
                    // Mark offline immediately and not ready
                    await playerRepo.update(player.id, { isOnline: false, isReady: false });

                    const lobby = await lobbyRepo.findByPlayerId(player.id);
                    if (lobby && lobby.id) {
                        // Remove the disconnected player from the lobby
                        const remainingPlayers = lobby.players.filter(pId => pId !== player.id);
                        
                        // If lobby had a battle in progress, mark it as finished (abandoned)
                        // We must NEVER reset battling/finished lobbies back to waiting,
                        // otherwise BattleModel duplicate key errors occur on lobby reuse.
                        let newStatus = lobby.status;
                        if (lobby.status === 'battling') {
                            newStatus = 'finished';
                        }
                        
                        await lobbyRepo.update(lobby.id, {
                            players: remainingPlayers,
                            status: newStatus
                        });
                        // Notify remaining player that opponent left (re-broadcast lobby state)
                        if (remainingPlayers.length > 0) {
                            await broadcastLobbyStatus(lobby.id);
                        }
                        console.log(`[Socket] Removed player ${player.nickname} from lobby ${lobby.id}. Remaining: ${remainingPlayers.length}`);
                    }
                }
                // We no longer delete the player record to keep history
            } catch (err) {
                console.error('[Socket] Error during disconnect cleanup:', err);
            }
        });

        socket.on('ready', async () => {
            try {
                console.log(`[Socket] ready requested by ${socket.id}`);
                const { battleStarted, battleState } = await readyPlayerUseCase.execute(socket.id);

                if (battleStarted && battleState) {
                    // Emit battle_start with currentTurnPlayerId
                    const battleStartPayload = {
                        currentTurnPlayerId: battleState.currentTurnPlayerId
                    };
                    io.to(battleState.lobbyId).emit('battle_start', battleStartPayload);
                    console.log(`[Socket] Emitted battle_start to room ${battleState.lobbyId}:`, JSON.stringify(battleStartPayload));

                    // Broadcast updated lobby_status AFTER battle_start so clients have fresh
                    // player data (including IDs) synchronized before the first attack.
                    await broadcastLobbyStatus(battleState.lobbyId);

                    // Broadcast new active battle to all lobbies globally
                    await broadcastGlobalHistory();
                } else {
                    // Find lobby to broadcast updated status (maybe one player is ready)
                    const player = await playerRepo.findBySocketId(socket.id);
                    if (player) {
                        const lobby = await lobbyRepo.findByPlayerId(player.id!);
                        if (lobby) {
                            await broadcastLobbyStatus(lobby.id!);
                        }
                    }
                }
            } catch (error) {
                console.error(`[Socket] Error in ready:`, error);
            }
        });

        socket.on('attack', async () => {
            try {
                console.log(`[Socket] attack requested by ${socket.id}`);
                const turnResult = await processAttackUseCase.execute(socket.id);

                const turnResultPayload: any = {
                    attackerId: turnResult.attackerId,
                    defenderId: turnResult.defenderId,
                    damage: turnResult.damage,
                    remainingHp: turnResult.defenderRemainingHp,
                    isDefeated: turnResult.isDefeated,
                    pokemonFainted: turnResult.pokemonFainted,
                    nextDefenderPokemon: turnResult.nextDefenderPokemon,
                    nextTurnPlayerId: turnResult.battleState.currentTurnPlayerId
                };

                if (turnResult.matchFinished) {
                    turnResultPayload.matchFinished = turnResult.matchFinished;
                }

                io.to(turnResult.battleState.lobbyId).emit('turn_result', turnResultPayload);
                if (turnResult.battleState && turnResult.battleState.battleLog) {
                    io.to(turnResult.battleState.lobbyId).emit('battle_history', { log: turnResult.battleState.battleLog });
                }
                console.log(`[Socket] Emitted turn_result to room ${turnResult.battleState.lobbyId}:`, JSON.stringify(turnResultPayload));

                if (turnResult.matchFinished && turnResult.winnerId) {
                    const winner = await playerRepo.findById(turnResult.winnerId);
                    if (winner) {
                        const battleEndPayload = {
                            winnerId: turnResult.winnerId,
                            winnerName: winner.nickname
                        };
                        io.to(turnResult.battleState.lobbyId).emit('battle_end', battleEndPayload);
                        console.log(`[Socket] Emitted battle_end to room ${turnResult.battleState.lobbyId}:`, JSON.stringify(battleEndPayload));

                        // Mark lobby as finished. We DO NOT reset to 'waiting'
                        // because that would lead to BattleModel duplicate key errors when re-used.
                        await lobbyRepo.update(turnResult.battleState.lobbyId, {
                            status: 'finished',
                            players: []
                        });
                        console.log(`[Socket] Marked lobby ${turnResult.battleState.lobbyId} as finished.`);

                        // Broadcast finished battle to all lobbies globally
                        await broadcastGlobalHistory();
                    }
                }
            } catch (error) {
                // Silently log out of turn attacks or invalid actions
                console.error(`[Socket] Attack rejected for ${socket.id}: ${(error as Error).message}`);
            }
        });

        socket.on('request_battle_history', async () => {
            try {
                const player = await playerRepo.findBySocketId(socket.id);
                if (player && player.id) {
                    const lobby = await lobbyRepo.findByPlayerId(player.id);
                    if (lobby && lobby.id && lobby.status === 'battling') {
                        const battle = await battleRepo.findByLobbyId(lobby.id);
                        if (battle && battle.battleLog) {
                            socket.emit('battle_history', { log: battle.battleLog });
                        }
                    }
                }
            } catch (error) {
                console.error(`[Socket] Error fetching history for ${socket.id}:`, error);
            }
        });

        socket.on('request_global_history', async () => {
            try {
                const history = await getGlobalHistoryUseCase.execute();
                socket.emit('global_history', history);
            } catch (error) {
                console.error(`[Socket] Error fetching global history for ${socket.id}:`, error);
            }
        });
    });
};
