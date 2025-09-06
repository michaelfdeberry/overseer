using System.Text.Json.Serialization;
using Overseer.Server.Data;

namespace Overseer.Server.Models;

public enum NotificationType
{
  Job,
  Simple,
}

[JsonDerivedType(typeof(JobNotification))]
public abstract class Notification : IEntity
{
  public int Id { get; set; }

  [JsonConverter(typeof(JsonStringEnumConverter))]
  public abstract NotificationType NotificationType { get; }

  public long Timestamp { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

  public string? Message { get; set; }

  public bool IsRead { get; set; } = false;

  // TODO: add common properties for notifications
}

public enum JobNotificationType
{
  JobStarted,
  JobPaused,
  JobResumed,
  JobCompleted,
  JobError,
}

public class JobNotification : Notification
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public override NotificationType NotificationType
  {
    get => NotificationType.Job;
  }

  [JsonConverter(typeof(JsonStringEnumConverter))]
  public JobNotificationType Type { get; set; }

  public int MachineId { get; set; }

  public int MachineJobId { get; set; }
}
