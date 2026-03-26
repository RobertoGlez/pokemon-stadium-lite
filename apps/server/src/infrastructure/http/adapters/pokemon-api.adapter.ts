import axios, { AxiosError } from 'axios';
import { IPokemonCatalogRepository, PokemonCatalogListItem } from '../../../domain/repositories/pokemon-catalog.repository';
import { PokemonBase } from '../../../domain/entities/pokemon.entity';
import { PokemonApiError } from '../errors/pokemon-api.error';

const REQUEST_TIMEOUT_MS = 5000;

export class PokemonApiAdapter implements IPokemonCatalogRepository {
    private readonly baseUrl = 'https://pokemon-api-92034153384.us-central1.run.app';

    private mapAxiosError(err: unknown, context: string): never {
        if (axios.isAxiosError(err)) {
            const ax = err as AxiosError;
            if (ax.code === 'ECONNABORTED') {
                throw new PokemonApiError(`El catálogo de Pokémon tardó demasiado (${context}).`);
            }
            if (ax.code === 'ERR_NETWORK' || !ax.response) {
                throw new PokemonApiError(`No se pudo conectar con el catálogo de Pokémon (${context}).`);
            }
            const status = ax.response.status;
            throw new PokemonApiError(`El catálogo respondió con error ${status} (${context}).`);
        }
        throw err;
    }

    async getPokemonList(): Promise<PokemonCatalogListItem[]> {
        try {
            const response = await axios.get<any>(`${this.baseUrl}/list`, {
                timeout: REQUEST_TIMEOUT_MS
            });
            return response.data?.data || response.data || [];
        } catch (err) {
            this.mapAxiosError(err, 'lista');
        }
    }

    async getPokemonDetails(id: number): Promise<PokemonBase> {
        try {
            const response = await axios.get<any>(`${this.baseUrl}/list/${id}`, {
                timeout: REQUEST_TIMEOUT_MS
            });
            // The API actually returns { success: true, data: { ... } }
            const data = response.data?.data || response.data[0] || response.data;

            if (!data || !data.id) {
                throw new PokemonApiError(`No se encontró el Pokémon con ID ${id}.`);
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
        } catch (err) {
            if (err instanceof PokemonApiError) {
                throw err;
            }
            this.mapAxiosError(err, `detalle ${id}`);
        }
    }
}
