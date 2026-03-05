# F-US-07: Pantalla de Victoria/Derrota

**Estado:** [x] DONE

## Descripción
Escuchar evento conclusivo e impedir que el usuario pulse algún botón si ya finalizó y perdió o ganó.

## Tareas (Tasks)
- [x] T1: Escuchar evento de Socket `battle_end`.
- [x] T2: Desplegar Modal absoluto bloqueador de la UI (Darken background) con texto "WINS!" o "LOSE" en base a la variable the WinnerName en payload.

## Criterios de Aceptación (Entregables)
- Interacción de juego efectivamente termianda tras cumplir criterio de 3 K.O.'s de un equipo completo.
