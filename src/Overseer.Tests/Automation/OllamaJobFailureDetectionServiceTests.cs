using System.Net;
using System.Text;
using Moq.Protected;
using Overseer.Server.Automation;
using Overseer.Server.Models;

namespace Overseer.Tests.Automation;

public class OllamaJobFailureDetectionServiceTests
{
    private readonly Mock<IHttpClientFactory> _mockHttpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
    private readonly HttpClient _httpClient;
    private readonly OllamaJobFailureDetectionService _service;

    public OllamaJobFailureDetectionServiceTests()
    {
        _mockHttpClientFactory = new Mock<IHttpClientFactory>();
        _mockHttpMessageHandler = new Mock<HttpMessageHandler>();

        // Create a real configuration with test values
        var configurationBuilder = new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                { "Ollama:BaseUrl", "http://localhost:11434" },
                { "Ollama:ModelName", "llava" },
                { "Ollama:Temperature", "0.1" },
                { "Ollama:TopP", "0.9" },
            }
        );
        _configuration = configurationBuilder.Build();

        _httpClient = new HttpClient(_mockHttpMessageHandler.Object);
        _mockHttpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>())).Returns(_httpClient);

        _service = new OllamaJobFailureDetectionService(
            _mockHttpClientFactory.Object,
            _configuration
        );
    }

    [Fact]
    public async Task AnalyzeForJobFailureAsync_WithValidResponse_ReturnsCorrectResult()
    {
        // Arrange
        var job = new MachineJob { Id = 1, MachineId = 1 };
        var previousImage = Encoding.UTF8.GetBytes("fake_previous_image_data");
        var currentImage = Encoding.UTF8.GetBytes("fake_current_image_data");

        var ollamaResponse = new
        {
            response = "{\"failure_detected\": true, \"confidence\": 0.85, \"failure_reason\": \"Spaghetti print detected\", \"details\": \"The print appears to have detached from the bed\"}",
        };

        var responseContent = new StringContent(
            JsonSerializer.Serialize(ollamaResponse),
            Encoding.UTF8,
            "application/json"
        );
        var httpResponse = new HttpResponseMessage(HttpStatusCode.OK) { Content = responseContent };

        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(httpResponse);

        // Act
        var result = await _service.AnalyzeForJobFailureAsync(job.Id, previousImage, currentImage);

        // Assert
        Assert.True(result.IsFailureDetected);
        Assert.Equal(0.85, result.ConfidenceScore);
        Assert.Equal("Spaghetti print detected", result.FailureReason);
        Assert.Contains("detached from the bed", result.Details);
    }

    [Fact]
    public async Task AnalyzeForJobFailureAsync_WithHttpError_ReturnsErrorResult()
    {
        // Arrange
        var job = new MachineJob { Id = 1, MachineId = 1 };
        var previousImage = Encoding.UTF8.GetBytes("fake_previous_image_data");
        var currentImage = Encoding.UTF8.GetBytes("fake_current_image_data");

        var httpResponse = new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("Ollama server error", Encoding.UTF8, "text/plain"),
        };

        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(httpResponse);

        // Act
        var result = await _service.AnalyzeForJobFailureAsync(job.Id, previousImage, currentImage);

        // Assert
        Assert.False(result.IsFailureDetected);
        Assert.Equal(0.0, result.ConfidenceScore);
        Assert.Equal("Analysis failed due to error", result.FailureReason);
        Assert.Contains("Ollama API request failed", result.Details);
    }
}
