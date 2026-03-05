# Business Requirements: Pokémon Stadium Lite

## 1. General Overview
The Pokémon Stadium Lite application is a multiplayer, turn-based battle game where two players can face off using assigned Pokémon teams. The core objective is to deliver a seamless battle experience from lobby creation to match resolution.

## 2. Core Functional Workflows

### 2.1. Lobby & Matchmaking
- **Entry**: A user must provide a **Trainer Nickname** to enter the global lobby.
- **Matchmaking Scope**: Only one global lobby is required. It holds up to two players for a single match.
- **Lobby States**:
  - `waiting`: 2 Players logged in, pending "ready" confirmation.
  - `ready`: Both players confirmed their teams.
  - `battling`: The match is actively in progress.
  - `finished`: One player's team is entirely defeated, and a winner is declared.

### 2.2. Team Assignment
- **Random Selection**: Upon entering the lobby, each player is assigned **3 random Pokémon** from the catalog.
- **Uniqueness Constraint**: The same Pokémon **cannot be assigned to both players**. All 6 Pokémon in a match must be unique.
- **Confirmation**: Players must press a "Ready" button to accept their team and signal they are prepared to battle.

### 2.3. Battle Mechanics & Turns
- **First Turn Priority**: The battle automatically starts when both players are "ready". The first turn is given to the player whose **active Pokémon has the highest Speed stat**. 
- **Sequential Turns**: Turns are strictly alternating. Only one action (attack) can be processed at a time.
- **Attack Action**: Initiated by a button on the client. The action hits the server, which independently calculates and returns the result to prevent cheating.

### 2.4. Damage Calculation Formula
All battles resolve damage using the following deterministic formula:
- **Calculation**: `Damage = Attacker Attack - Defender Defense`
- **Minimum Damage Rule**: If `Damage < 1`, then `Damage = 1`.
- **HP Update**: `Defender Current HP = Defender Current HP - Damage`
- **Floor Rule**: HP must never drop below `0`.

### 2.5. Defeat & Next Pokémon Logic
- A Pokémon is considered **defeated** if its `HP == 0`.
- Once a Pokémon is defeated:
  - If the player has another Pokémon in reserve, the **next Pokémon automatically enters** the battle.
  - Turn flow continues based on standard rules (alternating turns).
- If all 3 Pokémon of a player are defeated, the match ends, and the opposing player is declared the **Winner**.

## 3. Required Notifications (Game Events)
To maintain an engaging UX, the business requires visual/audio notifications to the players at specific milestones:
- Match start.
- Turn result (damage dealt and remaining HP of the defender).
- Pokémon defeat.
- New Pokémon entering the arena.
- Battle outcome (Win/Loss).
