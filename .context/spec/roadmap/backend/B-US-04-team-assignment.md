# B-US-04: Asignación de Equipos Aleatorios

**Estado:** [x] DONE

## Descripción
Como servidor, cuando un jugador lo solicite, debo asignarle 3 Pokémon únicos de forma aleatoria, asegurando que entre los 2 jugadores del mismo lobby no se repita nunca ningún Pokémon.

## Tareas (Tasks)
- [x] T1: Escuchar el evento socket `assign_pokemon`.
- [x] T2: Extraer la lista completa de la API externa (o mapear random de 1 a 151), e ir pidiendo Pokémones validados.
- [x] T3: Validar contra la base de datos del Lobby que el ID generado al azar no lo tenga ni el llamador ni el contrincante.
- [x] T4: Guardar los 3 pokemones en la base de datos para el Player y emitir `lobby_status`.

## Criterios de Aceptación (Entregables)
- El cliente dispara `assign_pokemon`. Inmediatamente la base de datos de MongoDB persiste 3 objetos Pokemon asociados a este player. El cliente recibe el Payload y puede observar 3 nombres diferentes de Pokémon asignados.
