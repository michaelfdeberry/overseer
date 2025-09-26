using Overseer.Server.Models;

namespace Overseer.Server.Automation;

public interface IJobFailureDetectionService
{
  /// <summary>
  /// Analyzes two webcam images to detect if a 3D printing job has failed
  /// </summary>
  /// <param name="jobId">The current job being monitored</param>
  /// <param name="machine">The machine being monitored</param>
  /// <param name="previousImage">The previous webcam capture</param>
  /// <param name="currentImage">The current webcam capture</param>
  /// <returns>Analysis result indicating if failure was detected</returns>
  Task<JobFailureAnalysisResult> AnalyzeForJobFailureAsync(int jobId, byte[] previousImage, byte[] currentImage);
}
