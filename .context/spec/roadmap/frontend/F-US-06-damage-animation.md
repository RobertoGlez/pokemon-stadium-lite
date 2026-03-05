# F-US-06: Animaciones de Daño Real-Time y Sincronización Exacta

**Estado:** [x] DONE

## Descripción
El usuario reporta que al atacar, la percepción del daño no se siente "en tiempo real" y carece de retroalimentación en batalla. Al reducir los HP del oponente, debe existir un elemento visual claro de que el Pokémon recibió un impacto (ej. un "fade" ligero rojo en el Sprite y texto flotante del daño recibido).

Adicionalmente, el frontend actualmente asume quién es el defensor a través del condicional suelto `p.id !== turnPlayerIdRef.current` al evaluar el `turn_result`. Esto es propenso a desincronizarse si dos clientes tienen una ligera latencia de estado.

## Solución Propuesta (Plan Eficiente)

### 1. Sincronización Exacta (Core)
Dependiendo de B-US-06, el evento `turn_result` ahora debe traer `defenderId` y `damage`.
- Modificar la función oyente de `turn_result` en `apps/web/src/core/context/LobbyContext.tsx` para que reste el HP explícitamente aplicando `if (p.id === data.defenderId)`.
- Exportar un nuevo State global en el contexto: `lastDamageEvent: { defenderId: string, damage: number, timestamp: number } | null` que se sobreescribe en cada `turn_result`.

### 2. Animaciones Reactivas (UI)
- Modificar `apps/web/src/features/battle/components/BattleArena.tsx`.
- Usar un Hook secundario `useEffect` que escuche los cambios de `lastDamageEvent`.
- Evaluar si `lastDamageEvent.defenderId` le pertenece al jugador local o al oponente.
- Al detectarlo, disparar temporalmente un state local `animateDamageFor: 'ally' | 'opponent' | null`. Un `setTimeout` de 800ms lo apagará solo.
- **CSS:** Si `animateDamageFor === 'opponent'`, renderizar al Sprite rival con clases de Tailwind como `brightness-150 sepia hue-rotate-[-50deg] saturate-[3]` o un keyframe custom temporal para tintarlo de rojo, e insertar un `div` absoluto arriba mostrando `-${lastDamageEvent.damage} HP` animando en Y hacia arriba (`-translate-y-8 opacity-0 transition-all`).

## Tareas (Tasks)
- [x] T1: Adaptar `LobbyContext.tsx` reemplazando la lógica implícita por explícita (`p.id === data.defenderId`) y exponer `lastDamageEvent`.
- [x] T2: Programar la intercepción de `lastDamageEvent` en `BattleArena.tsx`.
- [x] T3: Aplicar estilo Tailwind para el filtro rojo temporal al recibir daño.
- [x] T4: Renderizar el texto flotante de `<number> HP` que desaparece.
