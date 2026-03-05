# B-US-09: BUG — Lobby Lifecycle & Session Isolation

**Tipo:** Bug Fix / Edge Case  
**Estado:** [x] DONE  
**Archivo afectado:** `apps/server/src/presentation/gateways/lobby.gateway.ts`

---

## Descripción del Problema

Cuando una partida terminaba (`battle_end`), el lobby en MongoDB quedaba persistido con `status: "finished"` y su lista de jugadores intacta. Al iniciar una nueva sesión:

1. `findWaitingLobby()` consultaba lobbys con `status: "waiting"` y menos de 2 jugadores — por lo que el lobby `finished` era **ignorado correctamente**.
2. El **Jugador A** no encontraba lobby disponible → creaba un nuevo lobby propio.
3. El **Jugador B** tampoco encontraba lobby (porque el de A ya tenía 1 jugador, pero en MongoDB podía estar en estado inconsistente) → **en algunos casos creaba otro lobby propio**.
4. Ambos jugadores terminaban en **salas de Socket.IO distintas**.
5. `io.to(lobbyId).emit('lobby_status', ...)` nunca llegaba al otro jugador.
6. El Battle Lobby mostraba solo el jugador local y el slot de oponente permanecía "Esperando oponente…" indefinidamente, aunque ambos estuvieran conectados.

### Edge Cases adicionales

- Un jugador que se desconectaba **durante la batalla** dejaba al contrincante en una pantalla bloqueada, ya que el lobby quedaba en `status: "battling"` con un solo jugador, y `findWaitingLobby()` no lo recogía para la siguiente sesión.
- Al reconectarse después de un corte, el jugador anterior seguía en la colección `players` con su `socketId` obsoleto, lo que podía causar conflictos en `findBySocketId`.

---

## Solución Implementada

### 1. Reset del Lobby al terminar la batalla (`battle_end`)
Después de emitir `battle_end` con el ganador, el lobby se resetea en base de datos:

```typescript
await lobbyRepo.update(turnResult.battleState.lobbyId, {
    status: 'waiting',
    players: []
});
```

Esto garantiza que el próximo par de jugadores encuentre un lobby `waiting` con espacio disponible y se unan a la **misma sala de Socket.IO**.

### 2. Limpieza robusta en `disconnect`
El handler de desconexión fue extendido para:
- Encontrar el lobby del jugador desconectado.
- Eliminarlo del array `players` del lobby.
- Si el lobby estaba en `battling` o `finished`, resetearlo a `waiting`.
- Si quedan jugadores en el lobby, hacer un `broadcastLobbyStatus` para notificarles que el oponente salió.
- Eliminar el documento del jugador de MongoDB.

```typescript
socket.on('disconnect', async () => {
    const player = await playerRepo.findBySocketId(socket.id);
    if (player && player.id) {
        const lobby = await lobbyRepo.findByPlayerId(player.id);
        if (lobby && lobby.id) {
            const remainingPlayers = lobby.players.filter(pId => pId !== player.id);
            const shouldReset = lobby.status === 'battling' || lobby.status === 'finished' || remainingPlayers.length === 0;
            await lobbyRepo.update(lobby.id, {
                players: remainingPlayers,
                status: shouldReset ? 'waiting' : lobby.status
            });
            if (remainingPlayers.length > 0) {
                await broadcastLobbyStatus(lobby.id);
            }
        }
    }
    await playerRepo.deleteBySocketId(socket.id);
});
```

---

## Criterios de Aceptación

- [x] Al terminar una partida, ambos jugadores pueden reconectarse y verse mutuamente en el Battle Lobby en una nueva sesión.
- [x] Si un jugador se desconecta durante la partida, el lobby queda limpio y el siguiente par puede jugar sin reiniciar el servidor.
- [x] No quedan documentos de `Player` huérfanos con `socketId` obsoleto tras una desconexión.
- [x] El slot de oponente en el Battle Lobby se actualiza en tiempo real cuando el segundo jugador se une.

---

## Notas Técnicas

- El sistema soporta un **único lobby activo** (según los requerimientos — no hay múltiples lobbys simultáneos).
- Esta solución es compatible con la restricción de lobby único y no introduce complejidad adicional de gestión de salas.
- Una estrategia alternativa considerada fue crear un nuevo lobby en cada sesión, pero dado el requerimiento de lobby único, el reset fue la solución más limpia y alineada al diseño existente.
