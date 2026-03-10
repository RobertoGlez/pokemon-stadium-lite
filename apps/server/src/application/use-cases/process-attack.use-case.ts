import { PlayerRepository } from '../../domain/repositories/player.repository';
import { BattleRepository } from '../../domain/repositories/battle.repository';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { BattleState } from '../../domain/entities/battle.entity';
import { PokemonBase } from '../../domain/entities/pokemon.entity';

export interface TurnResult {
    attackerId: string;
    defenderId: string;
    damage: number;
    defenderRemainingHp: number;
    isDefeated: boolean;
    pokemonFainted?: boolean;
    nextDefenderPokemon?: PokemonBase;
    matchFinished?: boolean;
    winnerId?: string;
    battleState: BattleState;
}

export class ProcessAttackUseCase {
    constructor(
        private readonly playerRepository: PlayerRepository,
        private readonly lobbyRepository: LobbyRepository,
        private readonly battleRepository: BattleRepository
    ) { }

    async execute(socketId: string): Promise<TurnResult> {
        // 1. Resolve player
        const player = await this.playerRepository.findBySocketId(socketId);
        if (!player || !player.id) {
            throw new Error('Player not found');
        }
        const attackerId = player.id;

        // 2. Resolve lobby to find battle
        const lobby = await this.lobbyRepository.findByPlayerId(attackerId);
        if (!lobby || !lobby.id) {
            throw new Error('Lobby not found for player');
        }

        // 3. Resolve battle
        const battle = await this.battleRepository.findByLobbyId(lobby.id);
        if (!battle || !battle.id) {
            throw new Error('Battle not found for lobby');
        }

        // 4. Validate turn
        if (battle.currentTurnPlayerId !== attackerId) {
            throw new Error('Not the player\'s turn');
        }

        // 5. Identify defender
        // The teams map has keys of player IDs. 
        const playerIds = Array.from(battle.teams.keys());
        const defenderId = playerIds.find(id => id !== attackerId);
        if (!defenderId) {
            throw new Error('Defender not found in battle');
        }

        // 6. Get active Pokemons
        const activeAttackerIndex = battle.activePokemonIndex.get(attackerId) ?? 0;
        const activeDefenderIndex = battle.activePokemonIndex.get(defenderId) ?? 0;

        const attackerTeam = battle.teams.get(attackerId);
        const defenderTeam = battle.teams.get(defenderId);

        if (!attackerTeam || !defenderTeam) {
            throw new Error('Teams not found in battle state');
        }

        const attackerPokemon = attackerTeam[activeAttackerIndex];
        const defenderPokemon = defenderTeam[activeDefenderIndex];

        if (!attackerPokemon || !defenderPokemon) {
            throw new Error('Active Pokemons not found');
        }

        if (attackerPokemon.isDefeated || defenderPokemon.isDefeated) {
            throw new Error('Cannot attack with or against a defeated Pokemon');
        }

        // 7. Calculate damage
        const damage = Math.max(1, attackerPokemon.stats.attack - defenderPokemon.stats.defense);

        // 8. Apply damage
        defenderPokemon.stats.currentHp = Math.max(0, defenderPokemon.stats.currentHp - damage);

        // Add damage log
        battle.battleLog.push({
            id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
            type: 'damage',
            message: `${attackerPokemon.name} atacó a ${defenderPokemon.name} por ${damage} de daño.`,
            timestamp: new Date()
        });

        // 9. Check defeat condition
        let isDefeated = false;
        let pokemonFainted = false;
        let nextDefenderPokemon: PokemonBase | undefined = undefined;
        let matchFinished = false;
        let winnerId: string | undefined = undefined;

        if (defenderPokemon.stats.currentHp === 0) {
            defenderPokemon.isDefeated = true;
            isDefeated = true;
            pokemonFainted = true;

            battle.battleLog.push({
                id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
                type: 'defeat',
                message: `¡${defenderPokemon.name} fue derrotado!`,
                timestamp: new Date()
            });

            // T2: Find next Pokémon in the list that has isDefeated == false
            const nextIndex = defenderTeam.findIndex((p, i) => i !== activeDefenderIndex && !p.isDefeated);
            if (nextIndex !== -1) {
                // T3: Assign new index to the ActivePokemonTracker in the DB
                battle.activePokemonIndex.set(defenderId, nextIndex);
                nextDefenderPokemon = defenderTeam[nextIndex];

                const defenderPlayerName = (await this.playerRepository.findById(defenderId))?.nickname || 'El rival';
                battle.battleLog.push({
                    id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
                    type: 'switch',
                    message: `${defenderPlayerName} envía a ${nextDefenderPokemon.name}.`,
                    timestamp: new Date()
                });

            } else {
                // B-US-08: No more Pokémon left -> Match Finished
                matchFinished = true;
                winnerId = attackerId;
                battle.winnerId = attackerId;
                battle.currentTurnPlayerId = null;

                const attackerPlayerName = (await this.playerRepository.findById(attackerId))?.nickname || 'El retador';
                battle.battleLog.push({
                    id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 5),
                    type: 'winner',
                    message: `¡${attackerPlayerName} ha ganado la batalla!`,
                    timestamp: new Date()
                });

                lobby.status = 'finished';
                await this.lobbyRepository.update(lobby.id!, { status: 'finished' });
            }
        }

        // 10. Change turn
        if (!matchFinished) {
            battle.currentTurnPlayerId = defenderId;
        }

        // Update the defender's team in the map so Mongoose detects changes correctly
        battle.teams.set(defenderId, defenderTeam);

        const updatedBattle = await this.battleRepository.update(battle.id, {
            teams: battle.teams,
            activePokemonIndex: battle.activePokemonIndex,
            currentTurnPlayerId: battle.currentTurnPlayerId,
            winnerId: battle.winnerId,
            battleLog: battle.battleLog
        });

        if (!updatedBattle) {
            throw new Error('Failed to update battle state');
        }

        return {
            attackerId,
            defenderId,
            damage,
            defenderRemainingHp: defenderPokemon.stats.currentHp,
            isDefeated,
            pokemonFainted,
            nextDefenderPokemon,
            matchFinished,
            winnerId,
            battleState: updatedBattle
        };
    }
}
