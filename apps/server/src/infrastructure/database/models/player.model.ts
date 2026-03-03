import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
    nickname: string;
    socketId: string;
    joinedLobbyAt: Date;
}

const PlayerSchema: Schema = new Schema({
    nickname: { type: String, required: true },
    socketId: { type: String, required: true },
    joinedLobbyAt: { type: Date, default: Date.now },
});

export const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);
