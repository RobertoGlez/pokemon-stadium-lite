export class PokemonApiError extends Error {
    readonly code = 'POKEMON_API_ERROR';

    constructor(message: string) {
        super(message);
        this.name = 'PokemonApiError';
        Object.setPrototypeOf(this, PokemonApiError.prototype);
    }
}
