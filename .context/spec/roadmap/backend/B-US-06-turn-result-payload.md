# B-US-06: Bug - Payload de Turn Result incompleto para Data Binding

**Estado:** [x] DONE

## Descripción del Bug
El caso de uso en el Backend (`process-attack.use-case.ts`) calcula y retorna correctamente el `attackerId` y `defenderId`. Sin embargo, el Gateway encargado de emitir el evento Websocket (`lobby.gateway.ts`) filtra estos campos y solo envía el daño, HP restante y estado de victoria.

Debido a que el Frontend no recibe el `defenderId`, actualmente se ve obligado a "adivinar" a quién bajarle la vida restando que "el defensor es el que no tiene el currentTurn", lo cual puede causar desincronizaciones en tiempo real si el React State demora un frame extra en refrescar.

## Solución Propuesta
Modificar `apps/server/src/presentation/gateways/lobby.gateway.ts` para mapear directamente en el payload `attackerId` y `defenderId`.

## Tareas (Tasks)
- [x] T1: En la función `.on('attack')` de `lobby.gateway.ts`, inyectar explícitamente `attackerId: turnResult.attackerId` y `defenderId: turnResult.defenderId` dentro de la declaración inicial del objeto `turnResultPayload`.

## Criterios de Aceptación
- El evento WebSocket `turn_result` enviado contiene los IDs precisos del atacante y el defensor.
