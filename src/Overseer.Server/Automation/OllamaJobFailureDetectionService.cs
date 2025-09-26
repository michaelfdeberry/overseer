using System.Text;
using System.Text.Json;
using log4net;
using Overseer.Server.Models;

namespace Overseer.Server.Automation;

public class OllamaJobFailureDetectionService(IHttpClientFactory httpClientFactory, IConfiguration configuration) : IJobFailureDetectionService
{
  private static readonly ILog Log = LogManager.GetLogger(typeof(OllamaJobFailureDetectionService));
  private readonly HttpClient _httpClient = httpClientFactory.CreateClient();
  private readonly string _ollamaBaseUrl = configuration.GetValue("Ollama:BaseUrl", "http://localhost:11434")!;
  private readonly string _modelName = configuration.GetValue("Ollama:ModelName", "llava")!;
  private readonly decimal _temperature = configuration.GetValue("Ollama:Temperature", 0.1M);
  private readonly decimal _topP = configuration.GetValue("Ollama:TopP", 0.9M);

  public async Task<JobFailureAnalysisResult> AnalyzeForJobFailureAsync(int jobId, byte[] previousImage, byte[] currentImage)
  {
    try
    {
      var base64PreviousImage = Convert.ToBase64String(previousImage);
      var base64CurrentImage = Convert.ToBase64String(currentImage);
      var prompt = CreateAnalysisPrompt();
      var response = await SendOllamaRequestAsync(prompt, base64PreviousImage, base64CurrentImage);
      var result = ParseOllamaResponse(jobId, response);

      return result;
    }
    catch (Exception ex)
    {
      Log.Error($"Error analyzing job failure for job {jobId}", ex);
      return new JobFailureAnalysisResult
      {
        IsFailureDetected = false,
        ConfidenceScore = 0.0,
        FailureReason = "Analysis failed due to error",
        Details = ex.Message,
      };
    }
  }

  private static string CreateAnalysisPrompt()
  {
    var sb = new StringBuilder();
    sb.AppendLine("You are an AI assistant specialized in analyzing 3D printing job failures.");
    sb.AppendLine("You are looking at two separate webcam images from a 3D printer taken at different times during a print job.");
    sb.AppendLine("The FIRST image is from an earlier time, and the SECOND image is more recent.");
    sb.AppendLine("Compare these images to detect any failures that may have occurred between the two capture times.");
    sb.AppendLine("Please analyze these images for signs of 3D printing failures such as:");
    sb.AppendLine("- Spaghetti/stringy prints (failed adhesion, layer separation)");
    sb.AppendLine("- Print head crashes or collisions");
    sb.AppendLine("- Extruder jams or under-extrusion");
    sb.AppendLine("- Warping or lifting from the build platform");
    sb.AppendLine("- Support structure failures");
    sb.AppendLine("- Filament runout or feeding issues");
    sb.AppendLine("- Print detachment from bed");
    sb.AppendLine("- Layer shifts or misalignment");
    sb.AppendLine("- Overheating or thermal issues");
    sb.AppendLine("- Print stopped progressing or looks identical between images when it should have progressed");
    sb.AppendLine();
    sb.AppendLine("Compare the two images and look for:");
    sb.AppendLine("- Expected progress vs actual progress");
    sb.AppendLine("- New failure artifacts in the second image");
    sb.AppendLine("- Print quality degradation");
    sb.AppendLine("- Unexpected changes in print state");
    sb.AppendLine();
    sb.AppendLine("Respond with a JSON object in exactly this format:");
    sb.AppendLine("{");
    sb.AppendLine("  \"failure_detected\": true/false,");
    sb.AppendLine("  \"confidence\": 0.0-1.0,");
    sb.AppendLine("  \"failure_reason\": \"brief description of the failure type\",");
    sb.AppendLine("  \"details\": \"detailed explanation of what you observed\"");
    sb.AppendLine("}");
    sb.AppendLine();
    sb.AppendLine("Be conservative in your analysis - only report failures when you are reasonably confident.");

    return sb.ToString();
  }

  private async Task<string> SendOllamaRequestAsync(string prompt, string base64PreviousImage, string base64CurrentImage)
  {
    var requestBody = new
    {
      model = _modelName,
      prompt,
      stream = false,
      format = "json",
      images = new[] { base64PreviousImage, base64CurrentImage },
      options = new
      {
        temperature = _temperature,
        top_p = _topP,
        top_k = 40,
      },
    };

    var jsonContent = JsonSerializer.Serialize(requestBody);
    var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

    Log.DebugFormat("Sending request to Ollama at {0}/api/generate", _ollamaBaseUrl);

    var response = await _httpClient.PostAsync($"{_ollamaBaseUrl}/api/generate", content);
    if (!response.IsSuccessStatusCode)
    {
      var errorContent = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException($"Ollama API request failed with status {response.StatusCode}: {errorContent}");
    }

    return await response.Content.ReadAsStringAsync();
  }

  private static JobFailureAnalysisResult ParseOllamaResponse(int jobId, string response)
  {
    try
    {
      using var document = JsonDocument.Parse(response);
      var root = document.RootElement;

      if (!root.TryGetProperty("response", out var responseElement))
      {
        throw new InvalidOperationException("No 'response' property found in Ollama response");
      }

      // Directly parse the JSON content assuming 'format: json' was set
      var jsonContent = responseElement.GetString() ?? "";
      using var analysisDocument = JsonDocument.Parse(jsonContent);
      var analysisRoot = analysisDocument.RootElement;

      var failureDetected = analysisRoot.TryGetProperty("failure_detected", out var failureElement) && failureElement.GetBoolean();
      var confidence = analysisRoot.TryGetProperty("confidence", out var confidenceElement) ? confidenceElement.GetDouble() : 0.0;
      var failureReason = analysisRoot.TryGetProperty("failure_reason", out var reasonElement) ? reasonElement.GetString() : null;
      var details = analysisRoot.TryGetProperty("details", out var detailsElement) ? detailsElement.GetString() : null;

      return new JobFailureAnalysisResult
      {
        IsFailureDetected = failureDetected,
        ConfidenceScore = confidence,
        FailureReason = failureReason,
        Details = details,
      };
    }
    catch (Exception ex)
    {
      Log.Error($"Error parsing Ollama response: {response}", ex);

      // Fallback - try to determine failure from response text using keywords
      var lowerResponse = response.ToLowerInvariant();
      var failureKeywords = new[] { "failure", "failed", "problem", "issue", "error", "spaghetti", "detached", "warped" };
      var hasFailureKeywords = failureKeywords.Any(lowerResponse.Contains);

      return new JobFailureAnalysisResult
      {
        JobId = jobId,
        IsFailureDetected = hasFailureKeywords,
        ConfidenceScore = hasFailureKeywords ? 0.5 : 0.1,
        FailureReason = hasFailureKeywords ? "Possible failure detected in text analysis" : "No clear failure indicators",
        Details = $"Failed to parse structured response. Raw response: {response}",
      };
    }
  }

  public void Dispose()
  {
    _httpClient?.Dispose();
  }
}
