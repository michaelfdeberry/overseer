# Overseer Server & Plugin Architecture (C# / .NET)

## Architecture Context

The backend is built in C# and relies heavily on a plugin architecture to integrate with different machine providers and print failure detection machine learning models.

## C# Coding Standards

- Use modern C# language features (pattern matching, records, etc.) where appropriate.
- Follow standard .NET naming conventions (PascalCase for classes/methods, camelCase for local variables).
- Implement asynchronous programming (`async`/`await`) for all I/O bound operations.
- Avoid throwing raw `Exception` types; use or create specific exceptions.

## Plugin & Middleware Guidelines

- Ensure all new machine providers adhere to the core integration interfaces.
- Keep plugin implementations modular so they can be registered and loaded dynamically.
- Utilize standard ASP.NET Core middleware patterns for routing and request handling.
- Use explicit dependency injection for all services and configuration data.
