export interface Player {
    id?: string; // Optional for new players before persistence
    nickname: string;
    socketId: string;
    joinedLobbyAt: Date;
}
