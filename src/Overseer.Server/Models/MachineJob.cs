using System.Text.Json.Serialization;
using Overseer.Server.Data;

namespace Overseer.Server.Models;

public class MachineJob : IEntity
{
  public int Id { get; set; }

  public int MachineId { get; set; }

  public long? StartTime { get; set; }

  public long? EndTime { get; set; }

  public long? LastUpdate { get; set; }

  [JsonConverter(typeof(JsonStringEnumConverter))]
  public MachineState State { get; set; }

  [JsonConverter(typeof(JsonStringEnumConverter))]
  public JobNotificationType LastNotificationType { get; set; }

  public MachineStatus? LastStatus { get; set; }
}
