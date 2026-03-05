# F-US-06: Sistema de Notificaciones y Logs de Combate

**Estado:** [ ] TODO

## Descripción
El requerimiento pide que el sistema notifique a los jugadores al inicio de batalla, resultados del turno (daño dado y hp restante), pokemon vencidos y batallas finalizadas.

## Tareas (Tasks)
- [ ] T1: Escuchar evento de Socket `turn_result`. Formatear string: "[Oponente] hizo 5dmg, queda HP 30".
- [ ] T2: Formatear string: "[Tu pokemon] ha sido debilitado" si `pokemonFainted` es true.
- [ ] T3: Añadir string formatedo a un panel vertical de texto (un simple array div scrollable) "Battle Log History".
- [ ] T4: Actualizar Sprites y barra HP inmediatamente si el Payload trae Fainted Pokemon / Current Active Index alterado.

## Criterios de Aceptación (Entregables)
- La información del juego se imprime tal y como exigen las especificaciones textuales en la pantalla del usuario. Sin hacer "Silent changes" donde la barra baja pero no se notifica.
