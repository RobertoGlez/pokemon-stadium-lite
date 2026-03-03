import { PlayerRepository } from '../../domain/repositories/player.repository';
import { BattleRepository } from '../../domain/repositories/battle.repository';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { BattleState } from '../../domain/entities/battle.entity';

export interface TurnResult {
    attackerId: string;
    defenderId: string;
    damage: number;
    defenderRemainingHp: number;
    isDefeated: boolean;
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

        // 9. Check defeat condition
        let isDefeated = false;
        if (defenderPokemon.stats.currentHp === 0) {
            defenderPokemon.isDefeated = true;
            isDefeated = true;
        }

        // 10. Change turn
        battle.currentTurnPlayerId = defenderId;

        // Update arrays in the map so Mongoose detects changes correctly
        battle.teams.set(defenderId, defenderTeam);

        // 11. Save
        const updatedBattle = await this.battleRepository.update(battle.id, {
            teams: battle.teams,
            currentTurnPlayerId: battle.currentTurnPlayerId
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
            battleState: updatedBattle
        };
    }
}
