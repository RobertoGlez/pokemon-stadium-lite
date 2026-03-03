# Backend Technical Requirements: Pokémon Stadium Lite

## 1. System Architecture
The backend application must follow a **Clean Architecture** pattern to ensure maintainability and separation of concerns.
- **Domain Layer**: Core business entities (Player, PokemonState, Lobby, BattleState) and repository interfaces.
- **Application Layer**: Use cases handling logic (JoinLobbyUseCase, AssignPokemonUseCase, ProcessAttackUseCase, etc).
- **Infrastructure Layer**: Database interactions (MongoDB/Redis adapters), third-party API clients (PokemonCatalog API).
- **Presentation Layer**: HTTP controllers (Fastify/Express) and WebSocket gateways (Socket.IO or Native WebSockets).

## 2. Runtime & Core Technologies
- **Runtime**: Node.js (version 18+).
- **Framework**: Express or Fastify.
- **Protocols**:
  - REST API for fetching server configuration (`/`, `/api/health`).
  - WebSockets for real-time bidirectional battle communication.

## 3. Deployment & Execution Specs
- **Network Interface**: The backend must listen on `0.0.0.0`.
- **Port**: Must run locally on port `8080`.
- **Environment**: Proper environment variable definitions (`.env`) for secrets and configuration.

## 4. Integration & Third-Party Services
- **Pokémon Catalog API**:
  - Base URL: `https://pokemon-api-92034153384.us-central1.run.app/`
  - Get Catalog: `GET /list`
  - Get Details: `GET /list/:id`
  - *Must be consumed by the backend exclusively. The backend constructs the final normalized objects sent to the client.*

## 5. Persistence
- **Type**: Non-Relational Database (e.g., MongoDB, Redis).
- **Strategy**: Must be able to run locally (via instructions or Docker) or in the cloud.
- **Entities to Persist**:
  - Player Profiles.
  - Team Selections (3 unique random IPs per player).
  - Lobby State (waiting, ready, battling, finished).
  - Active Battle states & Pokémon statuses (current HP, defeated boolean).

## 6. Stability & Best Practices
- **Error Handling**: Centralized global exception and error handling across HTTP and WSS.
- **Concurrency Control**: Turn processing must be **atomic** to definitively prevent race conditions during attacks.
- **Resource Management**: Efficient resource usage (no excessive polling; purely event-driven WebSocket flow).
- **Synchronization**: Impeccable real-time synchronization between clients during attacks.
