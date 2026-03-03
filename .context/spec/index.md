# Spec-Driven Design Context: Pokémon Stadium Lite

## AI Context Strategy
This directory (`.context/spec/`) contains the optimized, Spec-Driven Design (SDD) artifacts required for an AI agent to build the Pokémon Stadium Lite application accurately without hallucinating requirements.

By reading the files in this directory, the AI will understand the domain boundaries, the required system events, and the strict rules governing the match flow. This context acts as the definitive source of truth across all architectural levels.

## Specification Map

| Spec File | Purpose |
| :--- | :--- |
| [`business_requirements.md`](./business_requirements.md) | Core logic, rules, and restrictions describing the battle engine and behavior. |
| [`frontend_technical_requirements.md`](./frontend_technical_requirements.md) | Stack choices, constraints, network bindings, UI/UX specs for Web and Mobile. |
| [`backend_technical_requirements.md`](./backend_technical_requirements.md) | Stack choices, constraints, deployment rules, and architecture for the Node.js server. |
| [`domain_models.md`](./domain_models.md) | Data dictionary mapping interfaces for core system entities across layers. |
| [`system_events.md`](./system_events.md) | Socket communication contracts spanning expected message payloads for real-time multiplayer. |
| [`openapi.yaml`](./openapi.yaml) | REST API contracts defining static configuration HTTP endpoints for initial connection. |

## AI Implementation Directives
- **Architecture**: Always scaffold backend services using standard Clean Architecture patterns. Ensure logic spans clearly defined `domain/`, `application/`, `infrastructure/`, and `presentation/` interfaces.
- **State Integrity**: Battles are sequential. When generating code, ensure the Turn UseCase utilizes a mutex or atomic update to strictly prevent two players acting in the same tick.
- **Dynamic Configs**: Frontend clients must retrieve their backend API source from user input upon initial app launch, avoiding hardcoded network strings.
- **Idempotency**: All endpoint interactions and events should gracefully handle double-clicks to protect the atomic state of the DB.
