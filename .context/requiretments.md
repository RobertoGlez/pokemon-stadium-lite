Test - Sr Fullstack Developer
Project: Pokémon Stadium Lite
Duration: Up to 7 days.

General Objective
Build a fullstack application that allows:
1. Retrieve a Pokémon catalog.
2. Pick a Pokémon team.
3. Log in to a lobby.
4. Face a realtime battle with another player.
5. Figure out who won the battle based on the basic rules.

The app must run on a local environment and just consume some external API’s for
catalog retrieval.

Functional Scope

1. Pokémon Catalog
Base URL:
https://pokemon-api-92034153384.us-central1.run.app/

Endpoint 1 – List
GET /list
Respuesta:
[{"id":1, "name": "Bulbasaur"},{"id":2, "name":"Ivysaur"}]

Endpoint 2 – Detail
GET /list/:id
Respuesta:
[{"id":1,"name":"Bulbasaur","type":["Grass","Poison"],"hp":0,"attack":0,"defense":0,"
speed":0,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sp
rites/pokemon/versions/generation-v/black-white/animated/1.gif"},{"id":2,"name
":"Ivysaur","type":["Grass","Poison"],"hp":0,"attack":0,"defense":0,"speed":0,"sprite"
:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/
versions/generation-v/black-white/animated/2.gif"}]

2. Team selection
A player can:
● Enter the lobby with a trainer nickname only.
● Have 3 random Pokémons assigned randomly from the catalog list.
● Confirm that it is ready.
● Battle with his Pokémon team until someone wins.

Constraints:
● Do not repeat a Pokémon between players.
● Every time must be randomly assigned.

3. Business Logic
Battle Flow & HP Calculation Rules
The lobby must wait until both players are marked as ready. Once the two players
are ready, the system must automatically start the battle.

When the battle starts, the first turn must be assigned to the player whose active
Pokémon has the highest Speed stat. From that point on, turns must be strictly
sequential — only one attack can be processed at a time.

Attacks must be triggered by a button in the client, which sends the action to the
server. The server must process each attack atomically before allowing the next turn.

There is no need to handle multiple lobbys, it can be a single one that handles an
unique match.

Damage & HP Calculation
Each attack must calculate damage using a simple and consistent formula:
● Damage = Attacker Attack - Defender Defense

If the result is less than 1, the damage must be set to 1 (minimum damage rule).

Then the defender’s HP is updated:
● Defender Current HP = Defender Current HP - Damage

HP must never go below 0.

Defeat Logic
After applying damage:
● If the defending Pokémon’s HP reaches 0, it is considered defeated.
● If the defending player has another available Pokémon, the next Pokémon
must automatically enter the battle.
● If there are no remaining Pokémon, the battle must end and the winner must
be declared.

Required Notifications
The system must notify players when:
● The battle starts
● A turn result is resolved (including damage dealt and remaining HP)
● A Pokémon is defeated
● A new Pokémon enters the battle
● The battle ends and a winner is declared

Additional notifications (such as turn changes) are welcome.

Lobby Status
There must be the following states possible for a lobby:
● waiting: 2 Players logged in and expecting them to be ready.
● ready: 2 players are ready.
● battling: Battle started.
● finished: There is a winner and the battle is finished.

Expected events:

Client→ Server:
● join_lobby - Allows a player to enter the lobby.
● assign_pokemon - Request the assignment of the Pokémon team to the
player.
● ready - Indicates that the player confirms their team and is ready to battle (If
both players are ready, lobby status changes to battling and server emits
battle_start).
● attack - Indicates that the player’s Pokémon makes an attack to the rival into
the server (to make HP update and emit turn_result).

Server→ Client:
● lobby_status - Synchronizes the current state of the lobby with all connected
players.
● battle_start - Signals that the battle has officially started (emitted when two
players are in ready state).
● turn_result - Represents the outcome of a single turn (emitted after damage
calculated, HP update).
● battle_end - Indicates that the battle has finished.

4. Persistence
Persistence
● All battle data must be persisted in the database:
○ Player.
○ Lobby (It can be a single lobby that allows 2 players at a time).
○ Team selection.
○ Battle.
○ Pokémon state (HP, defeated flag).
○ Battle status (waiting, ready, battling, finished).

Expected Architecture

Backend
● Node.js (18+).
● Express or Fastify.
● API REST and WebSockets or similar allowed.
● Non-relational database.
● Clean Architecture principles (clear separation between domain, application,
and infrastructure layers).
● Proper environment configuration (environment variables, secrets
management)
● Centralized exception handling.
● Efficient use of system resources (memory management, avoidance of
unnecessary polling, proper use of event-driven communication).

Frontend
● Flutter.
● React Web.
● Visual elements to simulate the battle experience, lobby state, and player
interactions.
● Clear separation between UI and business logic.

Deliverables
The candidate must provide:
1. A public Git repository containing:
○ Backend source code
○ Mobile/Web application source code
○ A README with clear setup instructions
2. A compiled Android APK or similar ready to install and test (if apply).

Backend Requirements
● Must run locally on port 8080
● Must listen on 0.0.0.0

Frontend Requirement
On first launch, the view must request the backend base URL (e.g.
http://192.168.X.X:8080).

The URL must:
● Be stored locally
● Be used for all API requests
● Not require recompilation to change

The reviewer will:
● Run the backend locally
● Install the APK on a physical Android device
● Enter their local IP
● Test the full flow

Database Requirements
The database can run locally with the proper instructions but also on cloud.

Bonus points
● If a real-time messaging system (such as native WebSockets or Socket.IO) is
implemented to handle communication between the backend and frontend.
● The player's turns and results are well synchronized.
● There are no race conditions.
● Anything is deployed on the cloud.