# F-US-04: Preparación para la Batalla (Ready UI)

**Estado:** [/] IN_PROGRESS

## Descripción
Como jugador visualmente quiero indicarle a mi compañero que estoy listo. Y que la pantalla haga la transición al coliseo de batalla.

## Tareas (Tasks)
- [ ] T1: Un botón de "Estoy Listo" (Bloquear visualmente tras clicarse). Emite `ready`.
- [ ] T2: Escuchar el evento WebSocket genérico de `battle_start`. 
- [ ] T3: Al recibir aviso de inicio, ocultar View "Lobby" y mostrar View o Component "BattleArena". es necesario crear el componente y la ruta

## Criterios de Aceptación (Entregables)
- Ventana transiciona fluídamente de Lobby a Batalla. No hay renderizados rotos. La arena muestra los datos iniciales y define quién tiene el primer turno resaltándolo o impidiéndoselo gráficamente.
