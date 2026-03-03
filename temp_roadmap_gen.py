import os

roadmap_dir = r"c:\workshop\test\pokemon-stadium-lite\.context\spec\roadmap"
os.makedirs(os.path.join(roadmap_dir, "backend"), exist_ok=True)
os.makedirs(os.path.join(roadmap_dir, "frontend"), exist_ok=True)

index_content = """# Roadmap & Master Plan: Pokémon Stadium Lite

Este documento es el índice principal del roadmap del proyecto. Las historias de usuario han sido separadas en dos flujos principals (Backend y Frontend) siguiendo estrictamente los `requiretments.md`. Cada historia contiene todos los pasos, entregables y criterios de aceptación.

## Backend (Server)

| ID | Historia de Usuario | Estado |
|---|---|---|
| [B-US-01](./backend/B-US-01-server-setup.md) | Configuración del Servidor y Base de Datos | [x] DONE |
| [B-US-02](./backend/B-US-02-pokemon-catalog.md) | Integración del Catálogo Pokémon Externo | [ ] TODO |
| [B-US-03](./backend/B-US-03-websocket-lobby.md) | WebSockets, Conexión y Salas (Lobby) | [ ] TODO |
| [B-US-04](./backend/B-US-04-team-assignment.md) | Asignación de Equipos Aleatorios | [ ] TODO |
| [B-US-05](./backend/B-US-05-ready-state.md) | Estado "Listo" y Comienzo de Batalla | [ ] TODO |
| [B-US-06](./backend/B-US-06-combat-core.md) | Motor de Combate y Cálculo de Daño | [ ] TODO |
| [B-US-07](./backend/B-US-07-fainting-logic.md) | Lógica de Fainting (Debilitamiento e Intercambio) | [ ] TODO |
| [B-US-08](./backend/B-US-08-match-finished.md) | Fin de Batalla y Declaración de Victoria | [ ] TODO |

---

## Frontend (React Web & Flutter Mobile)

| ID | Historia de Usuario | Estado |
|---|---|---|
| [F-US-01](./frontend/F-US-01-env-config.md) | Configuración Dinámica del Cliente (URL Local) | [x] DONE |
| [F-US-02](./frontend/F-US-02-lobby-login.md) | Petición de Nickname y Entrar al Lobby | [ ] TODO |
| [F-US-03](./frontend/F-US-03-team-selection.md) | Botón de Solicitar Equipo y Visualización | [ ] TODO |
| [F-US-04](./frontend/F-US-04-ready-ui.md) | Preparación para la Batalla (Ready UI) | [ ] TODO |
| [F-US-05](./frontend/F-US-05-battle-ui.md) | Interfaz de Batalla Activa (HP y Sprites) | [ ] TODO |
| [F-US-06](./frontend/F-US-06-combat-logs.md) | Sistema de Notificaciones y Logs de Combate | [ ] TODO |
| [F-US-07](./frontend/F-US-07-victory-screen.md) | Pantalla de Victoria/Derrota | [ ] TODO |
| [F-US-08](./frontend/F-US-08-flutter-app.md) | Cliente Móvil (App Android Flutter) | [ ] TODO |
"""

with open(os.path.join(roadmap_dir, "index.md"), "w", encoding="utf-8") as f:
    f.write(index_content)

# B-US-01
with open(os.path.join(roadmap_dir, "backend", "B-US-01-server-setup.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-01: Configuración del Servidor y Base de Datos

**Estado:** [x] DONE

## Descripción
Como sistema, necesito una capa base en Node.js que escuche en el puerto 8080 en `0.0.0.0` y que mantenga conexión persistente a una base de datos de MongoDB con los esquemas de Player, Lobby y Battle de acuerdo a Clean Architecture.

## Tareas (Tasks)
- [x] T1: Configurar servidor Fastify/Express exponiendo puerto 8080 host 0.0.0.0.
- [x] T2: Configurar MongoDB a través de Mongoose.
- [x] T3: Crear los Schemas correspondientes para las entidades del dominio.

## Criterios de Aceptación (Entregables)
- Servidor compila e inicia sin errores mostrando log con "Listening on 0.0.0.0:8080".
- Mongo DB muestra conexión lograda. Los Cors están completamente abiertos para testeo.
""")

# B-US-02
with open(os.path.join(roadmap_dir, "backend", "B-US-02-pokemon-catalog.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-02: Integración del Catálogo Pokémon Externo

**Estado:** [ ] TODO

## Descripción
Como backend, debo poder consultar la API externa obligatoria proporcionada (`https://pokemon-api-92034153384.us-central1.run.app/`) para listar IDs válidos y obtener los detalles exactos de cualquier Pokémon al armar equipos.

## Tareas (Tasks)
- [ ] T1: Crear un Repository Adapter en `infrastructure/http` que llame a `/list` y `/list/:id`.
- [ ] T2: Mapear la respuesta de la estructura estricta del external API hacia nuestras Entidades Limpias `PokemonBase`.

## Criterios de Aceptación (Entregables)
- Existe una prueba unificada o endpoint de Health Check que al dispararse loguee las stats de "Bulbasaur" traídas *directamente* desde la API remota.
""")

# B-US-03
with open(os.path.join(roadmap_dir, "backend", "B-US-03-websocket-lobby.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-03: WebSockets, Conexión y Salas (Lobby)

**Estado:** [ ] TODO

## Descripción
Como sistema, necesito manejar conexiones en tiempo real usando Socket.IO, permitir que un jugador entre con un apodo y asignarle un lobby.

## Tareas (Tasks)
- [ ] T1: Inicializar servidor Socket.IO en Fastify.
- [ ] T2: Escuchar el evento de socket `join_lobby(nickname)`.
- [ ] T3: Buscar si hay un lobby en status `waiting` (con 1 player). Si no, crear uno nuevo. Insertar o recuperar de base de datos.
- [ ] T4: Al entrar un player, emitir evento `lobby_status` actual a todos en el lobby.

## Criterios de Aceptación (Entregables)
- Con un cliente socket genérico (como Postman o el local de React), disparar `join_lobby`. El servidor nos une y recibimos en respuesta vía Socket un JSON con `status: waiting` y el array de `players` conteniendo nuestro nombre.
""")

# B-US-04
with open(os.path.join(roadmap_dir, "backend", "B-US-04-team-assignment.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-04: Asignación de Equipos Aleatorios

**Estado:** [ ] TODO

## Descripción
Como servidor, cuando un jugador lo solicite, debo asignarle 3 Pokémon únicos de forma aleatoria, asegurando que entre los 2 jugadores del mismo lobby no se repita nunca ningún Pokémon.

## Tareas (Tasks)
- [ ] T1: Escuchar el evento socket `assign_pokemon`.
- [ ] T2: Extraer la lista completa de la API externa (o mapear random de 1 a 151), e ir pidiendo Pokémones validados.
- [ ] T3: Validar contra la base de datos del Lobby que el ID generado al azar no lo tenga ni el llamador ni el contrincante.
- [ ] T4: Guardar los 3 pokemones en la base de datos para el Player y emitir `lobby_status`.

## Criterios de Aceptación (Entregables)
- El cliente dispara `assign_pokemon`. Inmediatamente la base de datos de MongoDB persiste 3 objetos Pokemon asociados a este player. El cliente recibe el Payload y puede observar 3 nombres diferentes de Pokémon asignados.
""")

# B-US-05
with open(os.path.join(roadmap_dir, "backend", "B-US-05-ready-state.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-05: Estado "Listo" y Comienzo de Batalla

**Estado:** [ ] TODO

## Descripción
Como lobby, cuando 2 jugadores estén "ready", la batalla debe comenzar y el servidor debe asignar incondicionalmente el primer turno al Pokémon activo con la estadística `Speed` más alta.

## Tareas (Tasks)
- [ ] T1: Escuchar el evento `ready`. Actualizar la bandera del Player en la DB.
- [ ] T2: Si ambos jugadores tienen bandera `isReady: true`, mutar status de Lobby a `battling`.
- [ ] T3: Seleccionar los Pokemones posición [0] de cada jugador. Comparar su speed. Asignar el `currentTurnPlayerId`.
- [ ] T4: Emitir evento `battle_start` incluyendo el ID del player del primer turno.

## Criterios de Aceptación (Entregables)
- Jugador 1 pulsa listo, Jugador 2 pulsa listo. Automaticamente el servidor emite `battle_start` y el Payload debe especificar exactamente el turno para el respectivo jugador que es matemáticamente comprobable su Pokémon es más rápido.
""")

# B-US-06
with open(os.path.join(roadmap_dir, "backend", "B-US-06-combat-core.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-06: Motor de Combate y Cálculo de Daño

**Estado:** [ ] TODO

## Descripción
Como motor de juego, debo procesar los ataques asegurando consistencia atómica. El daño se calcula como Attack - Defense (Mínimo 1).

## Tareas (Tasks)
- [ ] T1: Escuchar evento `attack`. Validar que el socket actual sea el dueño del `currentTurnPlayerId`. (Prevenir doble ataque).
- [ ] T2: Tomar el Attacker Attack y restarle el Defender Defense. Forzar Math.max(1, daño).
- [ ] T3: Restar daño al HP del defensor. 
- [ ] T4: Cambiar el turno hacia el otro oponente.
- [ ] T5: Emitir evento `turn_result` conteniendo (daño hecho, HP restante).

## Criterios de Aceptación (Entregables)
- Si un jugador lanza un evento atacando fuera de su turno se lanza un error silencioso de advertencia en logs.
- Si es su turno, se calcula daño constante. P.ej si Attacker tiene 50 atk, Defenser tiene 40 def. Daño total siempre será 10. `turn_result` muestra HP disminuído exactamente en 10.
""")

# B-US-07
with open(os.path.join(roadmap_dir, "backend", "B-US-07-fainting-logic.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-07: Lógica de Fainting (Debilitamiento e Intercambio)

**Estado:** [ ] TODO

## Descripción
Como motor de juego, The Defending Pokémon's HP must never go below 0. Si llega a 0, este se debilita y debe ingresar el siguiente.

## Tareas (Tasks)
- [ ] T1: Al restar HP y si resultado es <= 0, mutar variable estrictamente a 0. Marcar flag de pokemon `isDefeated = true`.
- [ ] T2: Buscar en la lista de combate el siguiente Pokémon en el índice con `isDefeated == false`
- [ ] T3: Asignar el nuevo índice al ActivePokemonTracker de ese jugador en la BD.
- [ ] T4: Adjuntar flag de `pokemonFainted: true` y la info del nuevo pokemon en el `turn_result`.

## Criterios de Aceptación (Entregables)
- Al propinar daño fatal, el log local en DB muestra vida total 0. El `turn_result` emitido indica que hubo un cambio y muestra las estadísticas del nuevo pokémon defensor activo.
""")

# B-US-08
with open(os.path.join(roadmap_dir, "backend", "B-US-08-match-finished.md"), "w", encoding="utf-8") as f:
    f.write("""# B-US-08: Fin de Batalla y Declaración de Victoria

**Estado:** [ ] TODO

## Descripción
Como motor de juego, si un jugador se queda sin ningún Pokémon viable en su lista array de 3 elementos, la batalla termina y se declara al oponente ganador.

## Tareas (Tasks)
- [ ] T1: Si no se encuentra un próximo `isDefeated == false` en la rutina anterior de cambio, el jugador está perdido.
- [ ] T2: Cambiar state de la Base de Datos a Lobby: `finished`.
- [ ] T3: Emitir `battle_end` con `winnerName`.
- [ ] T4: Destruir/limpiar la sala del Socket.

## Criterios de Aceptación (Entregables)
- Se emite de forma estricta el evento `battle_end`. El último ataque reduce el HP del Pokémon final a 0 y automáticamente se dispara victoria al otro jugador sin permitir más ataques.
""")

# F-US-01
with open(os.path.join(roadmap_dir, "frontend", "F-US-01-env-config.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-01: Configuración Dinámica del Cliente (URL Local)

**Estado:** [x] DONE

## Descripción
On first launch, the view must request the backend base URL. Be stored locally. Be used for all API requests. Not require recompilation.

## Tareas (Tasks)
- [x] T1: Implementar Modal inicial cuando LocalStorage está vacío con input para URL de backend.
- [x] T2: Configurar el cliente base de HTTP (Axis) u Websockets (Socketio client) que intercepte y asigne esta base en tiempo real.

## Criterios de Aceptación (Entregables)
- La aplicación compila. Se abre en Android browser/PC y retiene la URL. Refrescar la URL con un servidor vivo muestra un ping de "Salud del servidor: OK".
""")

# F-US-02
with open(os.path.join(roadmap_dir, "frontend", "F-US-02-lobby-login.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-02: Petición de Nickname y Entrar al Lobby

**Estado:** [ ] TODO

## Descripción
Como jugador, quiero una pantalla minimalista de bienvenida para ingresar mi Nickname (sin contraseñas) y conectar vía WebSocket usando la base de la URL.

## Tareas (Tasks)
- [ ] T1: Instalar `socket.io-client`.
- [ ] T2: Crear un Input Reactivo para "Nickname".
- [ ] T3: Pulsar "Entrar" dispara `socket.emit('join_lobby')`.
- [ ] T4: Suscripción al useEffect genérico para `lobby_status`. Mostrar UI de "Esperando contendiente..".

## Criterios de Aceptación (Entregables)
- El Input desaparece y la pantalla se transforma en un Lobby Room state. Se visualiza con claridad cuántos jugadores hay en la sala en vivo vía Socket extraído del store/estado local de React.
""")

# F-US-03
with open(os.path.join(roadmap_dir, "frontend", "F-US-03-team-selection.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-03: Botón de Solicitar Equipo y Visualización

**Estado:** [ ] TODO

## Descripción
En el Lobby, el jugador puede presionar un botón para obtener equipo y visualizar las imágenes de los 3 Pokémones que defenderá.

## Tareas (Tasks)
- [ ] T1: Botón "Randomize Team". Emite `assign_pokemon`.
- [ ] T2: Componente que reaccione al Payload `lobby_status` entrante y actualice el State para renderizar 3 Cards usando el sprite `.gif` u `.png` proveído desde el backend.

## Criterios de Aceptación (Entregables)
- Renderizado claro en la IU de la App (Flexbox) mostrando los 3 sprites en línea, con sus nombres correspondientes y sus HP base.
""")

# F-US-04
with open(os.path.join(roadmap_dir, "frontend", "F-US-04-ready-ui.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-04: Preparación para la Batalla (Ready UI)

**Estado:** [ ] TODO

## Descripción
Como jugador visualmente quiero indicarle a mi compañero que estoy listo. Y que la pantalla haga la transición al coliseo de batalla.

## Tareas (Tasks)
- [ ] T1: Un botón de "Estoy Listo" (Bloquear visualmente tras clicarse). Emite `ready`.
- [ ] T2: Escuchar el evento WebSocket genérico de `battle_start`. 
- [ ] T3: Al recibir aviso de inicio, ocultar View "Lobby" y mostrar View o Component "BattleArena".

## Criterios de Aceptación (Entregables)
- Ventana transiciona fluídamente de Lobby a Batalla. No hay renderizados rotos. La arena muestra los datos iniciales y define quién tiene el primer turno resaltándolo o impidiéndoselo gráficamente.
""")

# F-US-05
with open(os.path.join(roadmap_dir, "frontend", "F-US-05-battle-ui.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-05: Interfaz de Batalla Activa (HP y Sprites)

**Estado:** [ ] TODO

## Descripción
Como jugador inmersivo, deseo ver las barras de HP reactivas, los sprites grandes y el botón principal de Ataque. Separado entre oponente y aliado.

## Tareas (Tasks)
- [ ] T1: Mostrar el "Active Pokemon" en gran tamaño del equipo aliado y rival en columnas contrarias.
- [ ] T2: Rendereo de Barra de Vida nativa (HTML Progress o Div Width % reactivo en Tailwind/CSS puro).
- [ ] T3: Botón de "Ataque" el cual solo está cliqueable (CSS active/disabled) si el backend dictó mi turno asignado previamente. Al presionar emite `attack`.

## Criterios de Aceptación (Entregables)
- La UI se asemeja al esquema de juego (Sprites mirándose con flex-direction reverse si aplica). Barras de vida reaccionan entre el MaxHP y el CurrHP.
""")

# F-US-06
with open(os.path.join(roadmap_dir, "frontend", "F-US-06-combat-logs.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-06: Sistema de Notificaciones y Logs de Combate

**Estado:** [ ] TODO

## Descripción
El requerimiento pide que el sistema notifique a los jugadores al inicio de batalla, resultados del turno (daño dado y hp restante), pokemon vencidos y batallas finalizadas.

## Tareas (Tasks)
- [ ] T1: Escuchar evento de Socket `turn_result`. Formatear string: "[Oponente] hizo 5dmg, queda HP 30".
- [ ] T2: Formatear string: "[Tu pokemon] ha sido debilitado" si `pokemonFainted` es true.
- [ ] T3: Añadir string formatedo a un panel vertical de texto (un simple array div scrollable) "Battle Log History".
- [ ] T4: Actualizar Sprites y barra HP inmediatamente si el Payload trae Fainted Pokemon / Current Active Index alterado.

## Criterios de Aceptación (Entregables)
- La información del juego se imprime tal y como exigen las especificaciones textuales en la pantalla del usuario. Sin hacer "Silent changes" donde la barra baja pero no se notifica.
""")

# F-US-07
with open(os.path.join(roadmap_dir, "frontend", "F-US-07-victory-screen.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-07: Pantalla de Victoria/Derrota

**Estado:** [ ] TODO

## Descripción
Escuchar evento conclusivo e impedir que el usuario pulse algún botón si ya finalizó y perdió o ganó.

## Tareas (Tasks)
- [ ] T1: Escuchar evento de Socket `battle_end`.
- [ ] T2: Desplegar Modal absoluto bloqueador de la UI (Darken background) con texto "WINS!" o "LOSE" en base a la variable the WinnerName en payload.

## Criterios de Aceptación (Entregables)
- Interacción de juego efectivamente termianda tras cumplir criterio de 3 K.O.'s de un equipo completo.
""")

# F-US-08
with open(os.path.join(roadmap_dir, "frontend", "F-US-08-flutter-app.md"), "w", encoding="utf-8") as f:
    f.write("""# F-US-08: Cliente Móvil (App Android Flutter)

**Estado:** [ ] TODO

## Descripción
El requerimiento exige tener una aplicación Android que contenga un UI con toda esta lógica comunicándose a la IP Local backend del evaluador.

## Tareas (Tasks)
- [ ] T1: Replicate todo el sistema base React a Dart/Flutter usando el package socket_io_client.
- [ ] T2: Compilar final version como Android APK instalable (Release folder).

## Criterios de Aceptación (Entregables)
- Un APK válido provisto en el entregable o documentado en Github su proceso de Build, garantizando funcionalidad local si el backend original de Node.js está sirviendo tráfico en la PC local adjunta.
""")

print("Done")
