export interface PokemonStats {
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    speed: number;
}

export interface PokemonBase {
    id: number;
    name: string;
    types: string[];
    stats: PokemonStats;
    spriteUrl: string;
    isDefeated?: boolean;
}
