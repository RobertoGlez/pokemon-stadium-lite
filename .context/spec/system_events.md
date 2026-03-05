# System Events (WebSocket / Socket.IO)

This document defines the real-time interaction spec between Client and Server. Follow event-driven principles to ensure zero polling.

## 1. Client -> Server Requests (Emits)

### `join_lobby`
- **Payload**: `{ "nickname": "string" }`
- **Behavior**: Registers the player. If an open lobby exists (current occupancy = 1), assigns them to it. Otherwise, creates a new one. Returns the assigned `playerId`.

### `assign_pokemon`
- **Payload**: `{ "playerId": "string" }`
- **Behavior**: Server queries the external Catalog API for 3 distinct Pokémon. Assigns them to the player's team in memory/DB.

### `ready`
- **Payload**: `{ "playerId": "string" }`
- **Behavior**: Indicates player accepts their assigned team. If both players in the `Lobby` emit `ready`, the server shifts status to `battling`, calculates the active Speed stats to determine the first turn, and broadcasts `battle_start`.

### `attack`
- **Payload**: `{ "playerId": "string" }`
- **Behavior**: Initiates an attack. Server resolves the damage formula `max(1, Attacker Attack - Defender Defense)`. Decrements target HP, applies defeat rules if `HP == 0`, switches to next Pokémon if reserve exists. Rotates `currentTurnPlayerId`. Emits `turn_result`.

---

## 2. Server -> Client Responses (Broadcasts)

### `lobby_status`
- **Payload**: `{ "lobbyId": "string", "playerCount": 1 | 2, "status": "waiting | ready | battling | finished" }`
- **Trigger**: Emitted whenever a user connects, disconnects, or clicks `ready`.

### `battle_start`
- **Payload**: 
  ```json
  {
    "firstTurnPlayerId": "uuid",
    "teams": {
      "player_1_uuid": ["current active pokemon partial snippet"],
      "player_2_uuid": ["current active pokemon partial snippet"]
    }
  }
  ```
- **Trigger**: When both lobby players become `ready`.

### `turn_result`
- **Payload**: 
  ```json
  {
    "attackerId": "uuid",
    "defenderId": "uuid",
    "damageDealt": 15,
    "defenderRemainingHp": 20,
    "wasDefeated": false,
    "nextTurnPlayerId": "uuid"
  }
  ```
- **Trigger**: Delivered to both clients immediately after processing an `attack` event.

### `battle_end`
- **Payload**: `{ "winnerId": "uuid", "reason": "all_pokemon_defeated" }`
- **Trigger**: Fired when one team's final Pokémon is explicitly defeated.
