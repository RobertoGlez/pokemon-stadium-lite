# B-US-06: Motor de Combate y Cálculo de Daño

**Estado:** [ ] TODO

## Descripción
Como motor de juego, debo procesar los ataques asegurando consistencia atómica. El daño se calcula como Attack - Defense (Mínimo 1).

## Tareas (Tasks)
- [ ] T1: Escuchar evento `attack`. Validar que el socket actual sea el dueño del `currentTurnPlayerId`. (Prevenir doble ataque).
- [ ] T2: Tomar el Attacker Attack y restarle el Defender Defense. Forzar Math.max(1, daño).
- [ ] T3: Restar daño al HP del defensor. 
- [ ] T4: Cambiar el turno hacia el otro oponente.
- [ ] T5: Emitir evento `turn_result` conteniendo (daño hecho, HP restante).

## Criterios de Aceptación (Entregables)
- Si un jugador lanza un evento atacando fuera de su turno se lanza un error silencioso de advertencia en logs.
- Si es su turno, se calcula daño constante. P.ej si Attacker tiene 50 atk, Defenser tiene 40 def. Daño total siempre será 10. `turn_result` muestra HP disminuído exactamente en 10.
