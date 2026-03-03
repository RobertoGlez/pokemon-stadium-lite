import mongoose, { Document, Schema } from 'mongoose';
import { BattleState } from '../../../domain/entities/battle.entity';

export interface IBattleStateDocument extends Document, Omit<BattleState, 'id'> { }

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

export const BattleModel = mongoose.model<IBattleStateDocument>('Battle', BattleSchema);
