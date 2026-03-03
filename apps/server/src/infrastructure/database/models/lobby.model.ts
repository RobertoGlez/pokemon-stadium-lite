import mongoose, { Document, Schema } from 'mongoose';

export interface ILobby extends Document {
    status: 'waiting' | 'ready' | 'battling' | 'finished';
    players: string[]; // UUIDs or Mongo ObjectIds as strings
    createdAt: Date;
}

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

export const LobbyModel = mongoose.model<ILobby>('Lobby', LobbySchema);
