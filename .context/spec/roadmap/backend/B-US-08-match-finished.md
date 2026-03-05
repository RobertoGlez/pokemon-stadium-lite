# B-US-08: Fin de Batalla y Declaración de Victoria

**Estado:** [x] DONE

## Descripción
Como motor de juego, si un jugador se queda sin ningún Pokémon viable en su lista array de 3 elementos, la batalla termina y se declara al oponente ganador.

## Tareas (Tasks)
- [x] T1: Si no se encuentra un próximo `isDefeated == false` en la rutina anterior de cambio, el jugador está perdido.
- [x] T2: Cambiar state de la Base de Datos a Lobby: `finished`.
- [x] T3: Emitir `battle_end` con `winnerName`.
- [x] T4: Destruir/limpiar la sala del Socket.

## Criterios de Aceptación (Entregables)
- Se emite de forma estricta el evento `battle_end`. El último ataque reduce el HP del Pokémon final a 0 y automáticamente se dispara victoria al otro jugador sin permitir más ataques.
