# Architecture & System Design

SkillBridge is built as an npm workspace monorepo.

## Workspaces

- **`client`**: React 18, Vite, TypeScript, Tailwind CSS
- **`server`**: Node.js, Express, TypeScript, Prisma ORM (PostgreSQL)
- **`shared`**: Common TypeScript types, interfaces, enums, and API response models shared between client and server
- **`docs`**: Technical specs, API documentation, and architecture notes

## Data Flow

1. Client makes HTTP requests to Express backend API endpoints (`/api/...`).
2. Server routes validate input, authenticate requests using JWT, and execute Prisma database queries.
3. Common models (Users, Jobs, Applications) and API contract types are shared across workspaces from `@skillbridge/shared`.
