# SkillBridge — Full-Stack Career Portal

SkillBridge is a full-stack career platform designed to connect job seekers with employers. It provides tools for searching and posting job opportunities, managing applications, and building career profiles.

## Current Status

**Under active development (Foundation phase).**
The core monorepo structure, build pipelines, and workspace configurations are initialized. Database models, backend APIs, and frontend user interfaces are currently being implemented.

## Planned Features

- **Job Search & Discovery**: Search and filter job listings by role, type, location, and skills.
- **Job Seeker Profiles**: Profiles with resumes, skills, experience, and application history.
- **Employer Portal**: Post jobs, manage listings, and review applicant submissions.
- **Application Tracking**: Status updates for applicants and candidate review pipelines for employers.
- **Authentication & Roles**: Role-based access control (Job Seeker, Employer, Admin) using JWT authentication.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Shared**: Shared TypeScript types and API interfaces
- **Monorepo**: npm workspaces

## Project Structure

```
skillbridge/
├── client/          # React frontend (Vite + TypeScript + Tailwind CSS)
├── server/          # Express backend (Node.js + TypeScript + Prisma)
├── shared/          # Shared types and data models
└── docs/            # Project documentation and architecture specs
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### Installation

```bash
npm install
```

### Environment Setup

1. Copy the example environment files:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
2. Update the variables in `server/.env` with your PostgreSQL database credentials and JWT secret.

### Database Setup

```bash
# Generate Prisma client
npm run db:generate --workspace=server

# Run migrations (once database is connected)
npm run db:migrate --workspace=server
```

### Development

```bash
npm run dev
```

Starts the client on `http://localhost:5173` and the server on `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start client and server concurrently in development mode |
| `npm run build` | Build shared types, client bundle, and server |
| `npm run lint` | Run ESLint across client and server |
| `npm run format` | Format files with Prettier |
| `npm run type-check` | Type-check TypeScript across all workspaces |
