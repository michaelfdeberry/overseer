using System.Text.Json.Serialization;
using Overseer.Server.Data;

namespace Overseer.Server.Models;

public abstract class Alert : IEntity
{
  public int Id { get; set; }

  public long Timestamp { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

  public string? Message { get; set; }

  // TODO: add common properties for alerts
}

public enum JobAlertType
{
  JobStarted,
  JobPaused,
  JobResumed,
  JobCancelled,
  JobCompleted,
  JobError,
}

public class JobAlert : Alert
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public JobAlertType Type { get; set; }

  public int MachineId { get; set; }

  public int MachineJobId { get; set; }
}
