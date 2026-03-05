# B-US-05: Estado "Listo" y Comienzo de Batalla

**Estado:** [x] DONE

## Descripción
Como lobby, cuando 2 jugadores estén "ready", la batalla debe comenzar y el servidor debe asignar incondicionalmente el primer turno al Pokémon activo con la estadística `Speed` más alta.

## Tareas (Tasks)
- [x] T1: Escuchar el evento `ready`. Actualizar la bandera del Player en la DB.
- [x] T2: Si ambos jugadores tienen bandera `isReady: true`, mutar status de Lobby a `battling`.
- [x] T3: Seleccionar los Pokemones posición [0] de cada jugador. Comparar su speed. Asignar el `currentTurnPlayerId`.
- [x] T4: Emitir evento `battle_start` incluyendo el ID del player del primer turno.

## Criterios de Aceptación (Entregables)
- Jugador 1 pulsa listo, Jugador 2 pulsa listo. Automaticamente el servidor emite `battle_start` y el Payload debe especificar exactamente el turno para el respectivo jugador que es matemáticamente comprobable su Pokémon es más rápido.
