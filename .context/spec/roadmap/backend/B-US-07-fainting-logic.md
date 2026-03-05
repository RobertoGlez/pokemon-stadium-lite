# B-US-07: Lógica de Fainting (Debilitamiento e Intercambio)

**Estado:** [x] DONE

## Descripción
Como motor de juego, The Defending Pokémon's HP must never go below 0. Si llega a 0, este se debilita y debe ingresar el siguiente.

## Tareas (Tasks)
- [x] T1: Al restar HP y si resultado es <= 0, mutar variable estrictamente a 0. Marcar flag de pokemon `isDefeated = true`.
- [x] T2: Buscar en la lista de combate el siguiente Pokémon en el índice con `isDefeated == false`
- [x] T3: Asignar el nuevo índice al ActivePokemonTracker de ese jugador en la BD.
- [x] T4: Adjuntar flag de `pokemonFainted: true` y la info del nuevo pokemon en el `turn_result`.

## Criterios de Aceptación (Entregables)
- Al propinar daño fatal, el log local en DB muestra vida total 0. El `turn_result` emitido indica que hubo un cambio y muestra las estadísticas del nuevo pokémon defensor activo.
