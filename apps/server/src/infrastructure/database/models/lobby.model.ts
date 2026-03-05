import mongoose, { Document, Schema } from 'mongoose';
import { Lobby } from '../../../domain/entities/lobby.entity';

export interface ILobbyDocument extends Document, Omit<Lobby, 'id'> { }

const LobbySchema: Schema = new Schema({
    status: {
        type: String,
        enum: ['waiting', 'ready', 'battling', 'finished'],
        default: 'waiting',
        required: true
    },
    players: {
        type: [String],
        default: []
    },
    createdAt: { type: Date, default: Date.now },
});

export const LobbyModel = mongoose.model<ILobbyDocument>('Lobby', LobbySchema);
