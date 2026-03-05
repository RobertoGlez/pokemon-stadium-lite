# Domain Models: Pokémon Stadium Lite

These schemas represent the core entities utilized across all standard layers.

## Player
Identifies the user participating in the matchmaking and battle system.
```json
{
  "id": "uuid",
  "nickname": "string",
  "socketId": "string",
  "joinedLobbyAt": "timestamp"
}
```

## PokemonState
The active state of a specific Pokémon assigned to a player. Adapted from the Catalog API.
```json
{
  "id": "integer",
  "name": "string",
  "types": ["string"],
  "stats": {
    "maxHp": "integer",
    "currentHp": "integer",
    "attack": "integer",
    "defense": "integer",
    "speed": "integer"
  },
  "spriteUrl": "string",
  "isDefeated": "boolean"
}
```

## Lobby
The matchmaking room containing 2 players.
```json
{
  "id": "string",
  "status": "waiting | ready | battling | finished",
  "players": ["uuid"],
  "createdAt": "timestamp"
}
```

## BattleState
The aggregate root object containing the real-time match execution variables.
```json
{
  "lobbyId": "string",
  "teams": {
    "player_1_uuid": ["PokemonState"],
    "player_2_uuid": ["PokemonState"]
  },
  "activePokemonIndex": {
    "player_1_uuid": 0,
    "player_2_uuid": 0
  },
  "currentTurnPlayerId": "uuid",
  "winnerId": "uuid | null"
}
```
