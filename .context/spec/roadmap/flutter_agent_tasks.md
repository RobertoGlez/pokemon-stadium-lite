# Flutter Agent Tasks: Pokémon Stadium Lite

Este documento contiene las tareas secuenciales detalladas (prompts sugeridos) para que un Agente de IA ejecute y construya paso a paso la aplicación móvil de Pokémon Stadium Lite en Flutter, asegurando el cumplimiento de la guía de integración (`frontend_integration_guide.md`) y el diseño minimalista (`frontend_desing_guide.md`).

## Arquitectura Base (Feature-First)
El agente debe estructurar el proyecto en `lib/` de la siguiente manera:
- `core/`: Configuración global, cliente de WebSockets, temas y modelos comunes (`Player`, `PokemonBase`, `PokemonStats`).
- `features/auth/`: Pantalla de Login y lógica de ingreso.
- `features/lobby/`: Pantalla de espera, asignación de equipos y botón Ready.
- `features/battle/`: Interfaz de combate, animaciones de barras de HP, y emisión de ataques.
- `features/results/`: Pantalla final de victoria/derrota.

---

## 🛠️ Tarea 1: Setup del Proyecto y Core Architecture
**Prompt para el Agente:**
> "Inicializa un proyecto de Flutter para la app móvil de Pokémon Stadium Lite. 
> 1. Asegúrate de configurar la tipografía `Inter` (usa el paquete `google_fonts`).
> 2. Crea el archivo `lib/core/theme/app_theme.dart` implementando la paleta de colores de `frontend_desing_guide.md` (Fondo `#0B0F1A`, Paneles `#111827`, Botones `#2563EB`). Define los componentes base (`PrimaryButton`, `StadiumInput`, `StadiumCard`).
> 3. Implementa los modelos de datos en `lib/core/models/` basados exactamente en las interfaces de `frontend_integration_guide.md` (Player, PokemonStats, PokemonBase, Payloads de turno y lobby).
> 4. Configura el enrutamiento base (por ejemplo con `go_router` o el Navigator 2.0 estándar) para las rutas: `/`, `/lobby`, `/battle`, `/results`.
> No implementes UI compleja todavía, solo las carpetas, el tema y la configuración estructural funcional."

---

## 🔌 Tarea 2: Capa de WebSockets (`lib/core/network/`)
**Prompt para el Agente:**
> "Implementa la conexión persistente por WebSockets usando la librería `socket_io_client` en `lib/core/network/socket_client.dart`.
> 1. Crea una clase Singleton o un Provider que exponga el socket global (`io("http://localhost:8080", <opts>)` - permite configurar URL dinámica para dispositivos reales).
> 2. IMPORTANTE: En las opciones del socket no restrinjas el transporte solo a 'websocket', permite el fallback por defecto (`transports: ['websocket', 'polling']`).
> 3. Crea métodos wrapper para los emisores principales que indica la guía de integración: `emitJoinLobby(nickname)`, `emitAssignPokemon()`, `emitReady()`, `emitAttack()`.
> 4. Crea un sistema o streams para escuchar los eventos entrantes: `lobby_status`, `battle_start`, `turn_result`, `battle_end`.
> 5. Configura un State Management simple (por ejemplo `Provider` o `Riverpod`) que capture estos streams y exponga un estado reactivo global para toda la app."

---

## 👤 Tarea 3: Feature Auth (Pantalla de Login)
**Prompt para el Agente:**
> "Implementa la Feature de Autenticación (`lib/features/auth/`).
> 1. Desarrolla la UI de `LoginScreen.dart` basada en el diseño minimalista (campos redondeados a 10px, botones a 12px de radio).
> 2. Incluye un input para el Nickname y opcionalmente uno para configurar la IP del servidor backend (útil para testear en móviles físicos).
> 3. Al hacer submit, el app debe conectar el socket usando `emitJoinLobby` con el nickname proveído.
> 4. Escucha la conexión exitosa y navega a la ruta `/lobby`.
> 5. Maneja estados de carga (spinner) y errores de conexión (despliega un SnackBar rojo si falla)."

---

## 👥 Tarea 4: Feature Lobby y Asignación de Equipo
**Prompt para el Agente:**
> "Implementa la Feature de Lobby (`lib/features/lobby/`).
> 1. Desarrolla la UI de `LobbyScreen.dart`. Esta pantalla debe escuchar reactivamente el evento `lobby_status` desde el State Management global.
> 2. Al entrar por primera vez, si el jugador local no tiene un `team`, la app debe solicitarlo automáticamente (o mediante un botón "Pedir Equipo") llamando a `emitAssignPokemon()`.
> 3. Renderiza el equipo de 3 Pokémon: Crea un componente visual `PokemonCard` que muestre nombre, tipos, stats base y el `spriteUrl` cargando desde red.
> 4. Incorpora el botón principal 'Ready' (`PrimaryButton` de 48px de alto). Al presionarlo, lanza `emitReady()`.
> 5. Cuando el socket notifique el evento `battle_start` (validando que llegó el payload completo de ambos lados), navega automáticamente a la ruta `/battle`."

---

## ⚔️ Tarea 5: Feature Battle Arena
**Prompt para el Agente:**
> "Implementa el núcleo del combate en `lib/features/battle/BattleScreen.dart`. Sigue de forma estricta el paso 4 y 5 de la guía de integración.
> 1. UI Layout: Usa la mitad superior para el Oponente (Sprite, Nombre, Barra de HP de colores dinámicos calculando `currentHp / maxHp`) y la mitad inferior para el Jugador local. Usa animaciones sutiles (ej: `AnimatedContainer` para las barras de HP y colores semánticos: verde, amarillo, rojo).
> 2. Control de Turnos: Compara el `currentTurnPlayerId` (que vino en `battle_start`) con tu ID. Si NO es tu turno, deshabilita el botón de 'ATACAR' usando un estilo grisáceo opaco; si es tu turno, ilumínalo con el Action Blue (`#2563EB`).
> 3. Emisión de Ataque: Al presionar 'ATACAR', llama a `emitAttack()`.
> 4. Reacción a Daño (`turn_result`): Cuando llegue un resultado, anima la barra de vida hacia abajo. Si el payload dice `isDefeated: true` y `pokemonFainted: true`, renderiza una pequeña alerta de 'Pokémon debilitado'. Si incluye un `nextDefenderPokemon`, reemplaza la data y el GIF de inmediato."

---

## 🏆 Tarea 6: Logs de Combate y Feature Results
**Prompt para el Agente:**
> "Completa la experiencia de juego integrando Feedback textual y la resolución.
> 1. Crea un `BattleLogViewer` en alguna parte de la pantalla de la Arena (p. ej: un cuadro superpuesto con fondo opaco `#111827`). Alimenta este log parseando humanamente cada `turn_result` recibido (ej: 'El oponente recibió X de daño').
> 2. Escucha de forma global el evento `battle_end`.
> 3. Al recibirlo, navega de manera forzada a la pantalla `VictoryScreen.dart` (`lib/features/results/`).
> 4. Lee el payload de `battle_end` para decidir la UI: compara tu ID con el `winnerId`. Muestra un Banner gigante de VICTORIA con texto en verde o DERROTA en gris oscuro/rojo con espacios amplios, siguiendo la guía de diseño minimalista.
> 5. Añade un SecondaryButton transparente con bordes azules (`1px solid #2563EB`) que diga 'Volver al Inicio' y ejecute la limpieza del State (disconnect) y navegue a `/`."
