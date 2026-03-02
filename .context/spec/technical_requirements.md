# Technical Requirements: Pokémon Stadium Lite

## 1. System Architecture
The application must follow a **Clean Architecture** pattern to ensure maintainability and separation of concerns.
- **Domain Layer**: Core business entities (Player, Pokemon, Lobby, Battle rules).
- **Application Layer**: Use cases handling turn logic, team assignment, game flow.
- **Infrastructure Layer**: Database interactions, third-party API clients, WebSocket adapters.
- **Delivery Layer**: HTTP/WebSocket controllers.

## 2. Backend Specifications
- **Runtime**: Node.js (version 18+).
- **Framework**: Express or Fastify.
- **Communication Protocols**: 
  - REST API for fetching configuration.
  - WebSockets (Socket.IO or Native WebSockets) for real-time bidirectional battle communication.
- **Local Execution Target**: The backend must run locally on `0.0.0.0` and bind to port `8080`.
- **Best Practices**:
  - Proper environment variable definitions (`.env`).
  - Centralized global exception and error handling.
  - Efficient resource usage (no excessive polling; purely event-driven WebSocket flow).
  - Proper race loop mitigation (Turn processing must be **atomic** to prevent race conditions).

## 3. Frontend Specifications
- **Mobile Stack**: Flutter (compiled to Android APK for the final deliverable).
- **Web Stack**: React Web.
- **Dynamic Configuration**: On the first launch, the app must present a view requesting the backend Base URL (e.g., `http://192.168.0.X:8080`).
  - Must be stored locally (e.g., `SharedPreferences` in Flutter or `localStorage` in React).
  - Must be used for all subsequent HTTP and WebSocket connections.
  - Must not require a code recompile to alter.
- **Architecture**: Clear separation between UI components and business/state management logic.

## 4. Integration & Third-Party Services
- **Pokémon Catalog API**:
  - Base URL: `https://pokemon-api-92034153384.us-central1.run.app/`
  - Get Catalog: `GET /list`
  - Get Details: `GET /list/:id`
  - *Must be consumed by the backend. The backend constructs the final objects sent to the client.*

## 5. Persistence (Database)
- **Type**: Non-Relational Database (e.g., MongoDB, Redis).
- **Requirement**: Must be able to run locally or in the cloud.
- **Stored Entities**:
  - Player Profiles.
  - Team Selections.
  - Lobby State (waiting, ready, battling, finished).
  - Battle state & current Pokémon statuses (current HP, defeated boolean).

## 6. Deliverable Artifacts
- **Source Code**: Single public Git repository structure (Monorepo or clear separated folders for Backend, Web, Mobile).
- **Documentation**: A detailed `README.md` with foolproof setup, build, and run instructions.
- **Binary**: A compiled Android APK.

## 7. Quality & Bonus Criteria
- Impeccable real-time synchronization between clients during attacks.
- Robust state management to ensure turns do not double-process or glitch.
- Cloud deployment of backend and database (Bonus).
