# Spec-Driven Design Context: Pokémon Stadium Lite

## AI Context Strategy
This directory (`.context/spec/`) contains the optimized, Spec-Driven Design (SDD) artifacts required for an AI agent to build the Pokémon Stadium Lite application accurately without hallucinating requirements.

By reading the files in this directory, the AI will understand the domain boundaries, the required system events, and the strict rules governing the match flow. This context acts as the definitive source of truth across all architectural levels.

## Specification Map
1. **[Business Requirements](./business_requirements.md)**: Details the rules of the game, algorithms (like damage formulas), and the lifecycle of a match.
2. **[Technical Requirements](./technical_requirements.md)**: Outlines the infrastructure constraints, the specific tech stack (Node.js + Flutter/React), and architectural standards (Clean Architecture).
3. **[Domain Models](./domain_models.md)**: Contains the JSON-like entity definitions for Player, Pokemon, Lobby, and Battle statuses.
4. **[System Events](./system_events.md)**: Mappable payloads for Real-time WebSockets communication, including parameters and expected behaviors.
5. **[OpenAPI Contracts](./openapi.yaml)**: HTTP REST contracts for health checks and initialization.

## AI Implementation Directives
- **Architecture**: Always scaffold backend services using standard Clean Architecture patterns. Ensure logic spans clearly defined `domain/`, `application/`, `infrastructure/`, and `presentation/` interfaces.
- **State Integrity**: Battles are sequential. When generating code, ensure the Turn UseCase utilizes a mutex or atomic update to strictly prevent two players acting in the same tick.
- **Dynamic Configs**: Frontend clients must retrieve their backend API source from user input upon initial app launch, avoiding hardcoded network strings.
- **Idempotency**: All endpoint interactions and events should gracefully handle double-clicks to protect the atomic state of the DB.
