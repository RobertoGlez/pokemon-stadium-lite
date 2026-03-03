# F-US-05: Interfaz de Batalla Activa (HP y Sprites)

**Estado:** [ ] TODO

## Descripción
Como jugador inmersivo, deseo ver las barras de HP reactivas, los sprites grandes y el botón principal de Ataque. Separado entre oponente y aliado.

## Tareas (Tasks)
- [ ] T1: Mostrar el "Active Pokemon" en gran tamaño del equipo aliado y rival en columnas contrarias.
- [ ] T2: Rendereo de Barra de Vida nativa (HTML Progress o Div Width % reactivo en Tailwind/CSS puro).
- [ ] T3: Botón de "Ataque" el cual solo está cliqueable (CSS active/disabled) si el backend dictó mi turno asignado previamente. Al presionar emite `attack`.

## Criterios de Aceptación (Entregables)
- La UI se asemeja al esquema de juego (Sprites mirándose con flex-direction reverse si aplica). Barras de vida reaccionan entre el MaxHP y el CurrHP.
