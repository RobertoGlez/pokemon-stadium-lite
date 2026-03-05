import { PlayerRepository } from '../../domain/repositories/player.repository';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { IPokemonCatalogRepository } from '../../domain/repositories/pokemon-catalog.repository';
import { Player } from '../../domain/entities/player.entity';
import { PokemonBase } from '../../domain/entities/pokemon.entity';

export class AssignPokemonUseCase {
    constructor(
        private readonly playerRepository: PlayerRepository,
        private readonly lobbyRepository: LobbyRepository,
        private readonly pokemonCatalogRepository: IPokemonCatalogRepository
    ) { }

    async execute(socketId: string): Promise<Player> {
        const player = await this.playerRepository.findBySocketId(socketId);
        if (!player || !player.id) {
            throw new Error('Player not found or missing ID');
        }

        const lobby = await this.lobbyRepository.findByPlayerId(player.id);
        if (!lobby) {
            throw new Error('Lobby not found for player');
        }

        // Get opponent IDs
        const opponentIds = lobby.players.filter(pId => pId !== player.id);
        const opponentTeams: number[] = [];

        for (const opId of opponentIds) {
            const opponent = await this.playerRepository.findById(opId);
            if (opponent && opponent.team) {
                opponentTeams.push(...opponent.team.map(p => p.id));
            }
        }

        // Get valid pokemon IDs from the catalog
        const catalogList = await this.pokemonCatalogRepository.getPokemonList();
        // Depending on API response shape, assume it returns array or { data: [] }
        // The adapter might already return the data array
        const validIds = Array.isArray(catalogList) ? catalogList.map(p => p.id) : (catalogList as any)?.data?.map((p: any) => p.id) || [];

        if (validIds.length === 0) {
            throw new Error('No valid Pokemons found in catalog');
        }

        // Generate 3 unique IDs from validIds that are not in the opponentTeams
        // We will overwrite player's current team if they ask again.
        const assignedIds = new Set<number>();
        let safetyCounter = 0;
        while (assignedIds.size < 3 && safetyCounter < 100) {
            safetyCounter++;
            const randomIndex = Math.floor(Math.random() * validIds.length);
            const randomId = validIds[randomIndex];
            if (!opponentTeams.includes(randomId)) {
                assignedIds.add(randomId);
            }
        }

        if (assignedIds.size < 3) {
            throw new Error('Not enough unique Pokemons available to assign');
        }

        // Fetch pokemon details
        const team: PokemonBase[] = [];
        for (const pId of assignedIds) {
            const pokemon = await this.pokemonCatalogRepository.getPokemonDetails(pId);
            team.push(pokemon);
        }

        // Assign and save to player
        player.team = team;
        const updatedPlayer = await this.playerRepository.update(player.id, { team });
        if (!updatedPlayer) {
            throw new Error('Failed to update player team');
        }

        // When a player gets a team, business req says a 'Ready' confirmation is later.
        // We just assign for now.
        return updatedPlayer;
    }
}
