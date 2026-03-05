import mongoose, { Document, Schema } from 'mongoose';
import { Player } from '../../../domain/entities/player.entity';

export interface IPlayerDocument extends Document, Omit<Player, 'id'> { }

const PlayerSchema: Schema = new Schema({
    nickname: { type: String, required: true },
    socketId: { type: String, required: true },
    joinedLobbyAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    team: { type: Array, default: [] },
    isReady: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false }
});

export const PlayerModel = mongoose.model<IPlayerDocument>('Player', PlayerSchema);
