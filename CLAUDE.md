# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All application commands run from the `app/` directory.

```bash
# Start the full stack (app + MariaDB + Adminer)
docker compose up

# Install dependencies
cd app && bun install

# Run the app directly
cd app && bun run src/index.ts

# Run with hot reload
cd app && bun --hot src/index.ts

# Run tests
cd app && bun test

# Run a single test file
cd app && bun test src/path/to/file.test.ts
```

Database admin UI is available at http://localhost:8181 when using Docker Compose.

## Environment

Copy `db/.env.example` to `db/.env` and fill in database credentials before starting with Docker Compose.

## Architecture

This project implements **Clean Architecture** (Ports & Adapters / Hexagonal Architecture). The dependency rule flows strictly inward: Drivers → Adapters → Application → Domain.

```
src/
├── domain/           # Core business logic — no dependencies on outer layers
│   ├── entities/     # Business objects and rules
│   └── services/     # Domain services
├── application/      # Orchestration layer
│   ├── ports/
│   │   ├── inputs/   # Interfaces defining what the application exposes (use case contracts)
│   │   └── outputs/  # Interfaces defining what the application needs (repository contracts)
│   └── use-cases/    # Implementations of input ports; depend only on domain + output port interfaces
├── adapters/         # Implementations of ports
│   ├── controllers/  # HTTP request handlers — call use cases via input ports
│   ├── gateways/     # Implement output port interfaces (e.g., DB repositories)
│   └── presenters/   # Format application output for the delivery mechanism
└── drivers/          # Entry points (HTTP server setup, CLI, etc.)
```

**Key rule**: `application/` and `domain/` must never import from `adapters/` or `drivers/`. Dependencies always point inward.

## TypeScript Path Aliases

Configured in `app/tsconfig.json` — use these instead of relative paths:

- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@adapters/*` → `src/adapters/*`
- `@drivers/*` → `src/drivers/*`
- `@test/*` → `tests/*`

## Bun-Specific Notes

- Use `Bun.serve()` with routes — do not use Express
- Use `bun:sqlite` — do not use `better-sqlite3`
- Use `bun:test` with `expect` assertions — do not use Jest or Vitest
- Bun loads `.env` automatically — do not use `dotenv`
- Use `Bun.file` over `node:fs` readFile/writeFile
