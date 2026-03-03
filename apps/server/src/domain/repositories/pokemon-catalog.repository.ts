import { PokemonBase } from '../entities/pokemon.entity';

export interface PokemonCatalogListItem {
    id: number;
    name: string;
}

export interface IPokemonCatalogRepository {
    getPokemonList(): Promise<PokemonCatalogListItem[]>;
    getPokemonDetails(id: number): Promise<PokemonBase>;
}
