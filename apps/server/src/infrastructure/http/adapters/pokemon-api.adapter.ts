import axios from 'axios';
import { IPokemonCatalogRepository, PokemonCatalogListItem } from '../../../domain/repositories/pokemon-catalog.repository';
import { PokemonBase } from '../../../domain/entities/pokemon.entity';

export class PokemonApiAdapter implements IPokemonCatalogRepository {
    private readonly baseUrl = 'https://pokemon-api-92034153384.us-central1.run.app';

    async getPokemonList(): Promise<PokemonCatalogListItem[]> {
        const response = await axios.get<any>(`${this.baseUrl}/list`);
        return response.data?.data || response.data || [];
    }

    async getPokemonDetails(id: number): Promise<PokemonBase> {
        const response = await axios.get<any>(`${this.baseUrl}/list/${id}`);
        // The API actually returns { success: true, data: { ... } }
        const data = response.data?.data || response.data[0] || response.data;

        if (!data || !data.id) {
            throw new Error(`Pokemon with ID ${id} not found. Raw response: ${JSON.stringify(response.data)}`);
        }

        return {
            id: data.id,
            name: data.name,
            types: data.type, // Map 'type' to 'types'
            stats: {
                maxHp: data.hp,
                currentHp: data.hp,
                attack: data.attack,
                defense: data.defense,
                speed: data.speed,
            },
            spriteUrl: data.sprite,
            isDefeated: false
        };
    }
}
