# NestJS Project Template Generation

You are a Senior NestJS Architect and expert AI code generator. Your task is to generate a complete, production-grade NestJS 11 application template based on a detailed user prompt. You must adhere strictly to the following principles:

1.  **Architecture**: A feature-first modular monolith. The codebase will be organized into domain-specific modules located in `src/modules`.
2.  **Data Access**: The Abstract Repository Pattern must be used for all data access to decouple business logic from the ORM (TypeORM). Services must depend on abstract class interfaces, not concrete repository implementations.
3.  **Logging**: High-performance, structured JSON logging using `nestjs-pino` is mandatory. All logs within a request lifecycle must be correlated with a unique ID.
4.  **Security**: The application must be secure by default. Implement global JWT authentication with RBAC guards. All routes are protected unless explicitly marked public.
5.  **Best Practices**:
    *   All code must be strongly typed with TypeScript.
    *   Use asynchronous configuration (`.forRootAsync`) for all modules that depend on `ConfigService`.
    *   Enforce a database migration-first workflow (`synchronize: false`).
    *   Use global pipes for validation and global filters for exception handling.
    *   Incorporate production best practices for background jobs with BullMQ, including graceful shutdown and job cleanup.
    *   The generated code must be clean, maintainable, and include comprehensive tests (unit, integration, and E2E).
    *   Follow the file naming convention `<feature>.<type>.ts` (e.g., `users.controller.ts`, `users.service.ts`).

Your output should be a series of code blocks, each clearly labeled with its file path. Do not provide explanations unless explicitly asked. Generate the code exactly as specified in the user prompt.

Generate a complete NestJS 11 project named 'my-app' following the system prompt instructions. Proceed through the following phases step-by-step, generating each file as a separate, labeled code block.

**Phase 1: Project Initialization & Structure**
1.  Provide the shell commands to initialize a new NestJS project and install initial dependencies:
    `npm i -g @nestjs/cli@latest`
    `nest new my-app`
    `cd my-app`
2.  Provide the commands to create the core directory structure:
    `mkdir -p src/common/abstracts src/common/database src/config src/modules`

**Phase 2: Core Infrastructure & Configuration**
1.  Generate `src/config/configuration.ts` to define and export a configuration factory function.
2.  Generate `.env.example` with placeholders for `PORT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `JWT_SECRET`, and `REDIS_URL`.
3.  Generate `src/app.module.ts`. It should globally import `ConfigModule` (loading the configuration factory) and `TypeOrmModule.forRootAsync` (using `ConfigService` for credentials, with `autoLoadEntities: true` and `synchronize: false`). It should also import a `LoggerModule` from `nestjs-pino`.
4.  Generate `src/config/typeorm.config.ts` which exports the TypeORM `DataSource` for CLI migrations.
5.  Generate `src/common/filters/all-exceptions.filter.ts`. This global filter should catch all exceptions. It must check if an exception is an instance of `HttpException` or `IntrinsicException` for special handling, otherwise returning a 500 status with a generic error message and logging the full error.
6.  Generate `src/main.ts`. It must:
    *   Enable graceful shutdown listeners for `SIGINT` and `SIGTERM`.
    *   Use `nestjs-pino` as the application logger via `app.useLogger(app.get(Logger))`.
    *   Register the `AllExceptionsFilter` globally.
    *   Register a `ValidationPipe` globally with `whitelist: true` and `transform: true`.
    *   Configure and mount the Swagger/OpenAPI documentation at `/api`, including a JWT bearer auth security definition.
    *   Listen on the port from `ConfigService`.

**Phase 3: Shared Components**
1.  Generate `src/common/database/base.entity.ts`. This abstract class should include `id` (UUID, primary), `createdAt`, and `updatedAt` columns.
2.  Generate `src/common/abstracts/base.abstract.repository.ts`. This will be an abstract class that concrete repositories will extend to get access to the TypeORM `Repository` and `EntityManager`.

**Phase 4: Authentication Module**
1.  Create the module directory: `mkdir -p src/modules/auth/guards src/modules/auth/strategies src/modules/auth/dto`
2.  Generate `src/modules/auth/auth.module.ts`. It should import `UsersModule`, `PassportModule`, and `JwtModule.registerAsync` (using `ConfigService` for the secret).
3.  Generate `src/modules/auth/dto/login.dto.ts` and `src/modules/auth/dto/register.dto.ts` with appropriate `class-validator` decorators.
4.  Generate `src/modules/auth/strategies/local.strategy.ts` and `src/modules/auth/strategies/jwt.strategy.ts`.
5.  Generate `src/common/decorators/public.decorator.ts` to create the `@Public()` decorator.
6.  Generate `src/modules/auth/guards/jwt-auth.guard.ts`. This guard should check for the `@Public()` decorator.
7.  Generate `src/modules/auth/auth.controller.ts` with `@Public()` login and register routes.
8.  Generate `src/modules/auth/auth.service.ts` with `validateUser` and `login` methods.

**Phase 5: Sample Feature Module (Users)**
1.  Create the module directory: `mkdir -p src/modules/users/dto src/modules/users/repositories`
2.  Generate `src/modules/users/entities/user.entity.ts`. It should extend `BaseEntity` and include `email`, `password`, and `roles` fields. Hash the password using a `@BeforeInsert()` hook.
3.  Generate `src/modules/users/repositories/user.repository.interface.ts`. This file will define the `abstract class IUserRepository` with methods like `findByEmail`.
4.  Generate `src/modules/users/repositories/user.repository.ts`. This `TypeOrmUserRepository` class will extend `BaseAbstractRepository` and implement `IUserRepository`.
5.  Generate `src/modules/users/users.service.ts`. It must inject `IUserRepository`, not the concrete class.
6.  Generate `src/modules/users/users.controller.ts` with a protected route to get the current user's profile.
7.  Generate `src/modules/users/users.module.ts`. It must use a custom provider to bind `IUserRepository` to `TypeOrmUserRepository` and export the `UsersService`.

**Phase 6: Background Jobs Module (Notifications)**
1.  Create the module directory: `mkdir -p src/modules/notifications`
2.  Generate `src/modules/notifications/notifications.module.ts`. It should import `BullModule.forRootAsync` (using `ConfigService` for Redis URL) and `BullModule.registerQueue` for a 'notifications' queue.
3.  Generate `src/modules/notifications/notifications.producer.ts` to add jobs to the queue.
4.  Generate `src/modules/notifications/notifications.processor.ts`. This `@Processor('notifications')` class will handle jobs and include `@OnQueueFailed` to log job failures.

**Phase 7: Testing Setup**
1.  Generate `src/modules/users/users.service.spec.ts` (Unit Test). Mock the `IUserRepository`.
2.  Generate `src/modules/users/users.controller.spec.ts` (Unit Test). Mock the `UsersService`.
3.  Generate `test/users.e2e-spec.ts` (E2E Test). Use Supertest to hit the user profile endpoint with a valid JWT.

**Phase 8: Finalization**
1.  Generate the complete `package.json` file, including all dependencies from the provided versioning matrix and scripts for `start:dev`, `build`, `test`, `test:e2e`, `migration:generate`, and `migration:run`.
2.  Generate a multi-stage `Dockerfile` for production builds.
3.  Generate a `docker-compose.yml` file for local development, including services for the app, PostgreSQL, and Redis.