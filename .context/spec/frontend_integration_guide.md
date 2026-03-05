# Guía de Integración Frontend - Pokémon Stadium Lite

Bienvenido equipo de Frontend (React / Flutter). Esta es la documentación oficial para conectar vuestras aplicaciones cliente con el motor de batalla Backend de **Pokémon Stadium Lite**.

La arquitectura está completamente fundamentada en **WebSockets (Socket.IO)** asíncronos para garantizar velocidad y una experiencia en tiempo real, operando bajo un único Lobby global.

---

## 🔌 1. Conexión Principal

Antes de enviar cualquier interacción, el usuario debe establecer conexión de sockets al servidor.

- **Servidor Local por defecto**: `ws://<Local_IP>:8080` o `http://localhost:8080`
- **Protocolo**: WebSockets (`socket.io-client`)
- **Transports sugeridos**: `['websocket']`

Ejemplo de inicialización:
```javascript
import { io } from "socket.io-client";
// Reemplaza localhost si estás en dispositivo físico (Android/iOS)
const socket = io("http://localhost:8080", { transports: ['websocket'] });
```

---

## 🏛️ 2. Tipos de Datos (Interfaces Clave)

Para construir la interfaz gráfica (UI), recibirás estructuras anidadas JSON que representan fielmente este formato de TypeScript. Úsalas para moldear vuestro State Management (Redux, Provider, Bloc, Zustand, etc).

```typescript
// Información del Perfil
export interface Player {
    id: string;             // UUID único enviado por la BD
    nickname: string;       // El nombre visible
    socketId: string;       // El socket asociado (no lo necesitas en el Front)
    joinedLobbyAt: Date;    // Timestamp de entrada
    team?: PokemonBase[];   // El equipo de 3 Pokémones asignado
    isReady?: boolean;      // ¿El jugador presionó "Ready"?
}

// Estadísticas Vitales (Importante para barras de HP)
export interface PokemonStats {
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    speed: number;
}

// Representación individual del Pokémon
export interface PokemonBase {
    id: number;
    name: string;
    types: string[];         // Ejemplo: ["Grass", "Poison"]
    stats: PokemonStats;
    spriteUrl: string;       // URL directo al GIF Animado para renderizar
    isDefeated?: boolean;    // Si es true, el render debería ponerlo en gris o quitarlo
}
```

---

## ⚡ 3. El Flujo de Eventos: Paso a Paso

Todo el juego se basa en emitir (`socket.emit()`) e interceptar eventos (`socket.on()`).

### Paso 1: Entrar al Lobby
Una vez que el usuario escribe su nickname en la pantalla inicial:
- **Tu emites**: `socket.emit('join_lobby', 'TuNickname')`
- **El Server emite a todos**: `socket.on('lobby_status', (data) => { ... })`
  El servidor te devolverá al instante el estatus completo de la sala. *(Vea la sección 4 de Payload de Lobby)*.

### Paso 2: Solicitar el Equipo
Al entrar, el jugador **no** tiene un equipo asignado (`team` será null o undefined en el JSON del lobby). El Front debe proveer un UI o pedirlo automáticamente:
- **Tu emites**: `socket.emit('assign_pokemon')`
- **El Server realiza llamadas externas (API Pokedex) y responde masivamente con**:
  `socket.on('lobby_status', ...)`
  Ahora el objeto de tu jugador tendrá un arreglo poblado de 3 `PokemonBase` únicos y listos para leerse.

### Paso 3: Confirmar Equipo (Ready)
Muestra los 3 animaciones y stats en la UI. Si el jugador presiona jugar:
- **Tu emites**: `socket.emit('ready')`
- **El Server emite**: `socket.on('lobby_status', ...)` (Para ver checkmarks de quién está listo).

### Paso 4: Empieza la Batalla
Cuando **ambos** jugadores enviaron su evento de `ready`, el Servidor inicializa la base de datos de combate y dispara una sola vez esto para abrir la UI de Arena:
- **El Server emite**: `socket.on('battle_start', (data) => { ... })`
  - Payload: `{ currentTurnPlayerId: "id-del-jugador-que-va-primero" }`
  📌 *Nota:* El servidor asigna matemáticamente el primer turno a quien posea el Pokémon[0] con mayor velocidad. Debes habilitar o deshabilitar tu botón de Ataque comparando si tu `player.id` coincide con `currentTurnPlayerId`.

### Paso 5: ¡Atacar!
En el turno del jugador, cuando presione el botón de asalto de su UI:
- **Tu emites**: `socket.emit('attack')` *(No necesitas pasar datos, el server toma tu ID de Socket, deduce tu turno de forma Anti-Trampas y calcula todo internamente).*
- **El Server emite a todos**: `socket.on('turn_result', (data) => { ... })` *(Ver sección 5 para payload)*. Muestra las animaciones de resta de vida aquí.

### Final de Partida
Si de los embates el arreglo de un jugador queda vacío de vida, y el servidor envía el flag `matchFinished: true` en el testamento del último turno, inmediatamente disparará un último evento masivo y trancará la BD:
- **El Server emite**: `socket.on('battle_end', (data) => { ... })`
  - Payload: `{ winnerId: "uuid-1234", winnerName: "Alex" }`. Despliega tu Splash Screen de ganador o perdedor analizando si tu UUID del estado base corresponde al ganador.

---

## 📦 4. Forma Exacta de los Payloads

### A. Payload de estado de Lobby (`lobby_status`)
Escucha central para re-dibujar la pantalla de emparejamiento.
```json
{
  "id": "lobby-uuid",
  "status": "waiting | ready | battling | finished",
  "players": [ // El Array de máximo 2 elementos
    {
       "id": "uuid-1",
       "nickname": "Player1",
       "isReady": true,
       "team": [ ...los_3_objetos_PokemonBase... ] 
    },
    { ... }
  ]
}
```

### B. Payload resultivo de Turno (`turn_result`)
Llega cada vez que hubo daño oficial procesado por el Back.
```json
{
  "damage": 15,
  "remainingHp": 85,
  "isDefeated": false, 
  "pokemonFainted": false, 
  "nextDefenderPokemon": null,
  "nextTurnPlayerId": "uuid-rival-1234", // Opcional si ya se acabó el juego
  "matchFinished": false 
}
```
**💥 Si el ataque MATÓ al Pokémon rival, el payload cambia:**
```json
{
  "damage": 50,
  "remainingHp": 0,
  "isDefeated": true,
  "pokemonFainted": true, // Flag 🚨 UI Fainting Animation Trigger
  "nextDefenderPokemon": {
      // Información total completa del Pokémon reserva suplente que acaba de entrar 
      "id": 9, "name": "Blastoise", "stats": { "currentHp": 120, ... }, "spriteUrl": "..." 
  },
  "nextTurnPlayerId": "uuid-rival-1234"
}
```

---

## 🚫 5. Reglas de Interfaz / Prevención de Errores

1. **Race Conditions de Ataque**: El backend **ignora de forma silente** cualquier evento `attack` que venga del jugador que *no* posea el turno actual. Puedes emitir 1,000 requests erróneos que el server no explotará ni enviará respuestas erróneas que pudran tu estado. Solo debes deshabilitar tu botón por UX.
2. **Floor HP == 0**: La variable `remainingHp` jamás bajará a negativo. Modela la barra de progreso sin temor al `RangeError` (Si llega a 0, la vida es 0).
3. **Persistencia**: Si desconectas el WebServer o la DB se cae durante un desarrollo de Frontend, el Engine puede abortar temporalmente. Por favor levanta los repositorios localmente usando `npm run dev` sin alteración.
