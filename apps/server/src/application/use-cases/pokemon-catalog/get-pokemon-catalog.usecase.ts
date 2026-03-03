import { IPokemonCatalogRepository, PokemonCatalogListItem } from '../../../domain/repositories/pokemon-catalog.repository';

export class GetPokemonCatalogUseCase {
    constructor(private readonly pokemonCatalogRepository: IPokemonCatalogRepository) { }

    async execute(): Promise<PokemonCatalogListItem[]> {
        return this.pokemonCatalogRepository.getPokemonList();
    }
}
