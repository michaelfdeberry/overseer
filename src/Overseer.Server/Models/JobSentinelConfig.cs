namespace Overseer.Server.Models;

public class JobSentinelConfig
{
  public required Machine Machine { get; set; }
  public required MachineJob Job { get; set; }
  public byte[]? LastImageCapture { get; set; }
  public DateTime LastCaptureTime { get; set; }
  public CancellationTokenSource CancellationTokenSource { get; set; } = new();
}
