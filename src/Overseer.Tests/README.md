# Overseer.Tests

This project contains unit tests for the Overseer.Server application.

## Test Structure

- **Services/OllamaJobFailureDetectionServiceTests.cs**: Unit tests for the OllamaJobFailureDetectionService, which integrates with Ollama for AI-powered 3D printing failure detection.

## Running Tests

To run all tests:

```bash
dotnet test
```

To run tests with detailed output:

```bash
dotnet test --logger console --verbosity normal
```

To run tests in a specific file:

```bash
dotnet test --filter "FullyQualifiedName~OllamaJobFailureDetectionServiceTests"
```

## Test Coverage

The tests cover:

- Successful failure detection with valid Ollama responses
- Error handling for HTTP failures
- Fallback analysis when JSON parsing fails
- Request validation and configuration handling

## Dependencies

- **xunit**: Testing framework
- **Moq**: Mocking framework for dependencies
- **Microsoft.Extensions.Configuration**: For configuration testing
- **Microsoft.Extensions.Http**: For HTTP client testing
