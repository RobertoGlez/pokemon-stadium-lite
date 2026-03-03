# F-US-02: Petición de Nickname y Entrar al Lobby

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
