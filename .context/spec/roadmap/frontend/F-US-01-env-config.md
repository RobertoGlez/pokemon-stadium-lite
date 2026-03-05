# F-US-01: Configuración Dinámica del Cliente (URL Local)

**Estado:** [x] DONE

## Descripción
On first launch, the view must request the backend base URL. Be stored locally. Be used for all API requests. Not require recompilation.

## Tareas (Tasks)
- [x] T1: Implementar Modal inicial cuando LocalStorage está vacío con input para URL de backend.
- [x] T2: Configurar el cliente base de HTTP (Axis) u Websockets (Socketio client) que intercepte y asigne esta base en tiempo real.

## Criterios de Aceptación (Entregables)
- La aplicación compila. Se abre en Android browser/PC y retiene la URL. Refrescar la URL con un servidor vivo muestra un ping de "Salud del servidor: OK".
