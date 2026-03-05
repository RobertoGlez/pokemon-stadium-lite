# Mobile Roadmap: Pokémon Stadium Lite (Flutter)

Este roadmap define las fases de implementación para la versión móvil de la aplicación en **Flutter**, alineándose con los requerimientos de negocio (`business_requirements.md`), la guía de diseño (`frontend_desing_guide.md`) y la estructura existente de la aplicación web. El enfoque principal es mantener la simplicidad técnica y la paridad de funcionalidades.

## Fase 1: Setup y Fundamentos de UI (M-US-01)
**Objetivo:** Crear el proyecto base e implementar el **Design System** minimalista.

1. **Inicialización:** Crear proyecto Flutter estándar. Configuración para Android/iOS.
2. **Tipografía:** Importar la fuente `Inter` (Google Fonts).
3. **Tema (ThemeData):**
   - Configurar colores base: `Background (#0B0F1A)`, `Panels (#111827)`, `Primary (#2563EB)`.
   - Textos: `Primary (#F9FAFB)`, `Secondary (#9CA3AF)`.
4. **Componentes Base (Widgets):**
   - `PrimaryButton`, `SecondaryButton` (Border radius 12px).
   - `StadiumInput` (Border radius 10px, Focus color #2563EB).
   - `StadiumCard` (Border radius 14px, Padding 16px).
5. **Gestión de Estado y Rutas:**
   - Configurar `Provider` para mantener la gestión de estado lo más sencilla posible (equivalente a Context en React).
   - Navegación básica entre `LoginScreen` y `LobbyScreen`.

## Fase 2: Autenticación y Lobby (M-US-02)
**Objetivo:** Permitir al usuario introducir un nickname y conectarse al servidor.

1. **Pantalla de Login (`LoginScreen`):**
   - UI sencilla: Logo/Título, Input para Nickname, Botón de "Entrar".
2. **Conexión WebSockets:**
   - Integrar librería de WebSockets compatible con el servidor actual (e.g. `web_socket_channel` o `socket_io_client` dependiendo del backend).
   - Establecer conexión enviando el nickname.
3. **Flujo al Lobby:**
   - Al conectar y validar, navegar a `LobbyScreen`.

## Fase 3: Selección de Equipo (Team Selection) (M-US-03)
**Objetivo:** Mostrar los Pokémon asignados y confirmar la preparación (Ready).

1. **Pantalla de Lobby (`LobbyScreen`):**
   - UI para mostrar el estado actual: "Esperando un oponente...".
2. **Visualización del Equipo:**
   - Obtener los datos del evento WS de los 3 Pokémon asignados (Nombre, HP, Stats, Sprite).
   - Crear componente `PokemonCard` para listar los 3 Pokémon del jugador.
3. **Confirmación (Ready):**
   - Botón `Ready` que al pulsar envíe el evento de confirmación al servidor.
   - UI de espera mientras el otro jugador también da "Ready".

## Fase 4: Arena de Batalla (Battle Arena) (M-US-04)
**Objetivo:** Implementar la interfaz principal de combate siguiendo la guía de diseño.

1. **Pantalla de Batalla (`BattleScreen`):**
   - Layout fluido:
     - **Top/Mitad Superior:** Info del Oponente (Sprite, barra HP dinámica con colores verde/amarillo/rojo).
     - **Mitad Inferior:** Info del Jugador (Sprite de espaldas si la API lo permite, o frontal, barra HP).
2. **Panel de Acciones:**
   - Botón principal de **"ATACAR"**.
   - Validar turno antes de habilitar el botón.
3. **Gestión de Daño y Rotación:**
   - Escuchar eventos de ataque del servidor (`Damage = Attacker Attack - Defender Defense`).
   - Actualizar las barras de HP visualmente.
   - Si un Pokémon es derrotado (`HP == 0`), cambiar automáticamente los datos y SPRITE al siguiente en reserva (según el evento del server).

## Fase 5: Logs de Combate y Resolución (M-US-05)
**Objetivo:** Dar feedback al jugador de lo sucedido y mostrar resultado final.

1. **Battle Log (Consola de Batalla):**
   - Componente en la interfaz de la arena (probablemente en la parte media o baja inferior) que liste textos como: *"Bulbasaur atacó! Hizo 10 puntos de daño"*.
2. **Pantalla de Victoria/Derrota (`VictoryScreen`):**
   - Escuchar evento de "Match Finished" (cuando los 3 Pokémon de un lado se queden en 0 HP).
   - Mostrar Modal o redirigir a una pantalla con un Banner de "¡VICTORIA!" o "DERROTA", alineado al estilo visual que tenemos en la proof of concept web.
3. **Reiniciar Ciclo:**
   - Botón para volver al Inicio / Lobby para un nuevo matchmaking.

---
**Nota Técnica:** Todas las lógicas complejas de daño, turnos y rotación recaen única y exclusivamente en el servidor (backend). El cliente en Flutter se comportará como un **"dumb client"** reaccionando pasivamente a los eventos y pintando los estados de UI.
