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
- **Mobile First Focus**: All React Web interfaces **must** be designed with a Mobile-First approach, ensuring responsive and optimal visualization on smaller screens before scaling up to desktop views.
- **Typography**: The primary font for the application must be **Inter** (https://fonts.google.com/specimen/Inter) to ensure excellent readability and a minimal aesthetic.
- **UI Library / Components**: The project strongly encourages the use of **Shadcn UI** (https://ui.shadcn.com/) for base components (buttons, inputs, dialogs) due to its accessibility and customization. Additionally, **Magic UI** (https://magicui.design/) should be used for polished, animated interfaces (e.g., Globe component).
- **Visuals**: The UI must include visual elements to simulate the battle experience, the lobby state, and player interactions cleanly.
- **Real-Time Feedback**: Implement proper loading states while waiting for WebSocket events (e.g. waiting for opponent to join, waiting for opponent's turn).
- **Notifications**: Handle visual notifications representing damage dealt, remaining HP, when a Pokémon is defeated, and when a new Pokémon enters the battle.

## 5. Front-End Architecture
- **Architecture**: The React Web application must implement a **Feature-Based Architecture (FBD)** to achieve clear separation between UI and business logic, without the overhead of Strict Clean Architecture used in the backend. 
- **Structure**: The `src` directory must be organized vertically by business domains:
  - `src/app/`: Application-level config, main global providers, routing entry point.
  - `src/core/`: Application core logic, API clients (`fetch` / websockets), error handlers, interceptors.
  - `src/shared/`: Reusable UI components (buttons, text inputs, dialogs), utility functions, and agnostic hooks.
  - `src/features/`: Vertical slices of business logic (e.g., `lobby`, `battle`, `team-selection`). Each feature directory encapsulates its own `components`, `hooks`, `services` (API/Socket), and `stores` (state management).
- **Enforcement**: Avoid cross-feature direct dependencies whenever possible. A feature should expose an `index.ts` file as its public API, and other parts of the application should rely only on what is exported from there.
