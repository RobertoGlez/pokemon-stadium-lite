# B-US-03: WebSockets, Conexión y Salas (Lobby)

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
