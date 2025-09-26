using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Overseer.Server.Automation;

namespace Overseer.Tests.Automation;

public class OllamaJobFailureDetectionServiceIntegrationTests : IDisposable
{
    private readonly ServiceProvider _serviceProvider;
    private readonly OllamaJobFailureDetectionService _service;

    public OllamaJobFailureDetectionServiceIntegrationTests()
    {
        // Setup configuration
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    { "Ollama:BaseUrl", "http://localhost:11434" },
                    { "Ollama:ModelName", "llava" },
                    { "Ollama:Temperature", "0.1" },
                    { "Ollama:TopP", "0.9" },
                }
            )
            .Build();

        // Setup service collection
        var services = new ServiceCollection();
        services.AddHttpClient();
        services.AddSingleton<IConfiguration>(configuration);

        _serviceProvider = services.BuildServiceProvider();

        // Create service instance
        var httpClientFactory = _serviceProvider.GetRequiredService<IHttpClientFactory>();
        _service = new OllamaJobFailureDetectionService(httpClientFactory, configuration);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task AnalyzeForJobFailureAsync_WithEmbeddedImages_ShouldReturnAnalysisResult()
    {
        // Arrange
        var preFailImage = LoadEmbeddedResource("Overseer.Tests.Resources.prefail.png");
        var postFailImage = LoadEmbeddedResource("Overseer.Tests.Resources.postfail.png");

        // Act
        var result = await _service.AnalyzeForJobFailureAsync(2, preFailImage, postFailImage);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.ConfidenceScore >= 0.0 && result.ConfidenceScore <= 1.0);
        Assert.NotNull(result.Details);

        // Log the results for manual verification
        Console.WriteLine($"Failure Detected: {result.IsFailureDetected}");
        Console.WriteLine($"Confidence Score: {result.ConfidenceScore}");
        Console.WriteLine($"Failure Reason: {result.FailureReason}");
        Console.WriteLine($"Details: {result.Details}");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task AnalyzeForJobFailureAsync_WithSameImages_ShouldDetectNoProgress()
    {
        // Arrange
        var sameImage = LoadEmbeddedResource("Overseer.Tests.Resources.prefail.png");

        // Act - Using the same image twice should potentially indicate no progress
        var result = await _service.AnalyzeForJobFailureAsync(1, sameImage, sameImage);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.ConfidenceScore >= 0.0 && result.ConfidenceScore <= 1.0);
        Assert.NotNull(result.Details);

        // Log the results for manual verification
        Console.WriteLine($"Same Image Test - Failure Detected: {result.IsFailureDetected}");
        Console.WriteLine($"Same Image Test - Confidence Score: {result.ConfidenceScore}");
        Console.WriteLine($"Same Image Test - Failure Reason: {result.FailureReason}");
        Console.WriteLine($"Same Image Test - Details: {result.Details}");
    }

    private static byte[] LoadEmbeddedResource(string resourceName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        using var stream = assembly.GetManifestResourceStream(resourceName);

        if (stream == null)
        {
            var availableResources = assembly.GetManifestResourceNames();
            throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' not found. Available resources: {string.Join(", ", availableResources)}"
            );
        }

        using var memoryStream = new MemoryStream();
        stream.CopyTo(memoryStream);
        return memoryStream.ToArray();
    }

    public void Dispose()
    {
        _service?.Dispose();
        _serviceProvider?.Dispose();
        GC.SuppressFinalize(this);
    }
}
