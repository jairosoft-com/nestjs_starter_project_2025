# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Compact Summary

**Project**: Modular monolithic NestJS 11 application
**Key Features**: JWT auth, TypeORM + PostgreSQL, BullMQ queues, Swagger docs
**Architecture**: Feature modules, repository pattern, dependency injection
**Testing**: Jest unit/e2e tests, TDD approach
**Security**: bcrypt, JWT, global auth guard, input validation
**Quick Start**: `npm run start:dev` (requires Docker for DB/Redis)

## Essential Commands

### Development
```bash
npm run start:dev      # Start with hot reload (recommended for development)
npm run start:debug    # Start in debug mode
npm run build          # Build the application
npm run start:prod     # Run production build
```

### Code Quality
```bash
npm run lint           # Lint and auto-fix code issues
npm run format         # Format code with Prettier
npm run type-check     # Check TypeScript types without building
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Generate coverage report
npm run test:e2e       # Run end-to-end tests
```

### Database
```bash
npm run migration:generate -- -n MigrationName  # Generate migration from entity changes
npm run migration:run                           # Apply pending migrations
npm run migration:revert                        # Revert last migration
```

### Docker
```bash
docker-compose up -d   # Start all services (app, postgres, redis)
docker-compose down    # Stop all services
```

## Architecture Overview

This is a **modular monolithic NestJS application** with the following key architectural decisions:

### Module Structure
- **Feature-based modules** in `src/modules/`: Each feature (auth, users, notifications) is self-contained
- **Repository pattern**: Interfaces in domain layer, implementations in infrastructure
- **Dependency injection**: All dependencies injected via NestJS IoC container

### Core Components
1. **Authentication**: JWT-based with Passport strategies (Local + JWT). Use `@Public()` decorator for non-authenticated endpoints
2. **Database**: TypeORM with PostgreSQL, base entity class for common fields, migrations support
3. **Queue System**: BullMQ for background jobs (see notifications module)
4. **API Documentation**: Swagger available at `/api` endpoint
5. **Configuration**: Environment-based using `@nestjs/config` with validation

### Key Patterns
- **DTOs** for request/response validation using class-validator
- **Custom decorators** in `src/common/decorators/`
- **Global exception filter** for consistent error responses
- **Abstract repository interface** for testability
- **Pino logger** for structured logging

### Testing Approach
- Unit tests mock dependencies (see `users.service.spec.ts` for pattern)
- E2E tests use supertest for HTTP testing
- Test files co-located with source files (`.spec.ts`)

### Security
- Passwords hashed with bcrypt
- JWT tokens for authentication
- Global auth guard (all endpoints protected by default)
- Input validation via DTOs and pipes
- Non-root user in Docker container