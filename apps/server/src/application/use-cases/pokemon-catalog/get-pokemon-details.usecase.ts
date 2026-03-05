import { IPokemonCatalogRepository } from '../../../domain/repositories/pokemon-catalog.repository';
import { PokemonBase } from '../../../domain/entities/pokemon.entity';

export class GetPokemonDetailsUseCase {
    constructor(private readonly pokemonCatalogRepository: IPokemonCatalogRepository) { }

    async execute(id: number): Promise<PokemonBase> {
        if (!id || id <= 0) {
            throw new Error('Invalid Pokemon ID');
        }
        return this.pokemonCatalogRepository.getPokemonDetails(id);
    }
}
