# B-US-05: Bug - Jugadores Atrapados en "Waiting for opponent" (Turn Logic Bug)

**Estado:** [ ] TODO

## Descripción del Bug
El Front-End depende de la comparación entre `currentTurnPlayerId` (enviado en el evento `battle_start`) y el `id` asignado a su propio perfil (`localPlayer.id`) para habilitar el botón de Ataque y deducir quién tiene el turno.

Sin embargo, en el Back-End (`apps/server/src/presentation/gateways/lobby.gateway.ts`), la función `broadcastLobbyStatus` extrae y mapea una versión simplificada de los jugadores para enviarla en el payload de `lobby_status`. En este mapeo, el servidor **omite por error enviar el campo `id`**.

Debido a esto, el Front-End recibe jugadores sin `id`, lo que provoca que la validación `currentTurnPlayerId === localPlayer?.id` resulte siempre en `Undefined === String`, bloqueando el juego para ambos jugadores.

## Solución Propuesta
Modificar `apps/server/src/presentation/gateways/lobby.gateway.ts`, específicamente en la línea 30 dentro de `broadcastLobbyStatus`, para adjuntar el campo `id` al payload del jugador.

**Código a modificar en `lobby.gateway.ts`:**
```typescript
        const playersData = [];
        for (const playerId of lobby.players) {
            const p = await playerRepo.findById(playerId);
            if (p) {
                playersData.push({
                    id: p.id, // <--- AGREGAR ESTA LÍNEA
                    nickname: p.nickname,
                    team: p.team || [],
                    isReady: p.isReady || false
                });
            }
        }
```

## Tareas (Tasks)
- [ ] T1: Modificar `lobby.gateway.ts` para que exponga el `id` del jugador en el broadcast de WebSockets.
- [ ] T2: Reiniciar el servidor Node.js y validar en el Front-End que el botón de Ataque se habilite para el jugador con el Pokémon más rápido.

## Criterios de Aceptación
- El evento WebSocket `lobby_status` incluye el `id` de cada jugador.
- Los jugadores ya no se quedan permanentemente atrapados en "Waiting for opponent...". El primer turno se asigna correctamente en el Frontend.
