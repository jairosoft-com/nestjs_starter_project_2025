# --- UNIVERSAL CODING PRINCIPLES ---

1. **Maintainability**: Code should be easy to modify, debug, and understand.
2. **Understandability/Readability**: Write clear, self-explanatory code. Use descriptive names and appropriate comments.
3. **Modularity** (Single Responsibility Principle - SRP): Each function, class, or module should have one primary responsibility and reason to change.
4. **Testability**: Structure code to be easily testable.
   - *Prefer Pure Functions*: For data processing and core logic, generate functions that, given the same input, always return the same output and have no side effects.
   - *Use Dependency Injection (DI)*: Pass dependencies (e.g., services, API clients, database connections) as arguments to functions or constructors rather than creating them internally. This allows for easier mocking in tests.
   - *Minimize and Isolate Side Effects*: Clearly separate code with side effects (e.g., I/O, DOM manipulation, logging) from pure logic.
5. **DRY** (Don't Repeat Yourself): Avoid redundant code. Abstract common patterns into reusable functions, classes, or modules.
6. **KISS** (Keep It Simple, Stupid): Favor simplicity in design and implementation. Avoid unnecessary complexity.
