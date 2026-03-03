# F-US-03: Botón de Solicitar Equipo y Visualización

**Estado:** [ ] TODO

## Descripción
En el Lobby, el jugador puede presionar un botón para obtener equipo y visualizar las imágenes de los 3 Pokémones que defenderá.

## Tareas (Tasks)
- [ ] T1: Botón "Randomize Team". Emite `assign_pokemon`.
- [ ] T2: Componente que reaccione al Payload `lobby_status` entrante y actualice el State para renderizar 3 Cards usando el sprite `.gif` u `.png` proveído desde el backend.

## Criterios de Aceptación (Entregables)
- Renderizado claro en la IU de la App (Flexbox) mostrando los 3 sprites en línea, con sus nombres correspondientes y sus HP base.
