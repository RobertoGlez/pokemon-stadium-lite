# Frontend Technical Requirements: Pokémon Stadium Lite

## 1. Supported Platforms & Stacks
The project requires building interfaces for both Mobile and Web platforms:
- **Mobile Stack**: Flutter (compiled to Android APK for the final deliverable).
- **Web Stack**: React JS (via Vite).

## 2. Dynamic Configuration & Initialization
- **First Launch Prompt**: On the first launch, the app must present a configuration view requesting the backend Base URL (e.g., `http://192.168.0.X:8080`).
- **Storage**: The configured URL must be stored locally persistently (e.g., `SharedPreferences` in Flutter or `localStorage` in React).
- **Persistence Across Sessions**: The prompt should only appear if no URL is currently saved or if the user explicitly chooses to disconnect.
- **Usage**: This URL must be used as the base for all subsequent HTTP and WebSocket connections natively.
- **Build constraint**: Must *not* require a code recompile to alter or target a different server in the same local network.

## 3. Communication Patterns
- **API Fetching**: Native `fetch` (Web) or `http` (Flutter) capable of hitting REST endpoints (like `/api/health`).
- **Real-Time WebSockets**: Must implement a WebSocket client listener (e.g., `socket.io-client`) to subscribe to events (`lobby_status`, `battle_start`, `turn_result`, `battle_end`) and emit actions (`join_lobby`, `assign_pokemon`, `ready`, `attack`).

## 4. UI / UX Design Characteristics
- **Visuals**: The UI must include visual elements to simulate the battle experience, the lobby state, and player interactions cleanly.
- **Real-Time Feedback**: Implement proper loading states while waiting for WebSocket events (e.g. waiting for opponent to join, waiting for opponent's turn).
- **Notifications**: Handle visual notifications representing damage dealt, remaining HP, when a Pokémon is defeated, and when a new Pokémon enters the battle.
- **Architecture**: Clear separation between UI drawing components and business/state management logic. Avoid spaghetti code tying DOM/Widget operations directly to socket parsers.
