import mongoose, { Document, Schema } from 'mongoose';

interface PokemonStats {
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    speed: number;
}

interface PokemonState {
    id: number;
    name: string;
    types: string[];
    stats: PokemonStats;
    spriteUrl: string;
    isDefeated: boolean;
}

export interface IBattleState extends Document {
    lobbyId: string;
    teams: Map<string, PokemonState[]>;
    activePokemonIndex: Map<string, number>;
    currentTurnPlayerId: string | null;
    winnerId: string | null;
}

const PokemonStatsSchema = new Schema({
    maxHp: { type: Number, required: true },
    currentHp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    speed: { type: Number, required: true }
}, { _id: false });

const PokemonStateSchema = new Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    types: { type: [String], required: true },
    stats: { type: PokemonStatsSchema, required: true },
    spriteUrl: { type: String, required: true },
    isDefeated: { type: Boolean, default: false }
}, { _id: false });

const BattleSchema: Schema = new Schema({
    lobbyId: { type: String, required: true, unique: true },
    teams: {
        type: Map,
        of: [PokemonStateSchema],
        default: {}
    },
    activePokemonIndex: {
        type: Map,
        of: Number,
        default: {}
    },
    currentTurnPlayerId: { type: String, default: null },
    winnerId: { type: String, default: null }
});

export const BattleModel = mongoose.model<IBattleState>('Battle', BattleSchema);
