# B-US-02: Integración del Catálogo Pokémon Externo

**Estado:** [x] DONE

## Descripción
Como backend, debo poder consultar la API externa obligatoria proporcionada (`https://pokemon-api-92034153384.us-central1.run.app/`) para listar IDs válidos y obtener los detalles exactos de cualquier Pokémon al armar equipos.

## Tareas (Tasks)
- [x] T1: Crear un Repository Adapter en `infrastructure/http` que llame a `/list` y `/list/:id`.
- [x] T2: Mapear la respuesta de la estructura estricta del external API hacia nuestras Entidades Limpias `PokemonBase`.

## Criterios de Aceptación (Entregables)
- Existe una prueba unificada o endpoint de Health Check que al dispararse loguee las stats de "Bulbasaur" traídas *directamente* desde la API remota.
