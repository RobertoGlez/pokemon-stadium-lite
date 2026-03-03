export type LobbyStatus = 'waiting' | 'ready' | 'battling' | 'finished';

export interface Lobby {
    id?: string;
    status: LobbyStatus;
    players: string[]; // UUIDs or Mongo ObjectIds as strings
    createdAt: Date;
}
