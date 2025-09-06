using System.Text.Json.Serialization;

namespace Overseer.Server.Machines.Moonraker.Models;

public class HeatersResponse
{
  [JsonPropertyName("result")]
  public HeatersResult? Result { get; set; }
}

public class HeatersResult
{
  [JsonPropertyName("eventtime")]
  public double EventTime { get; set; }

  [JsonPropertyName("status")]
  public HeatersStatus? Status { get; set; }
}

public class HeatersStatus
{
  [JsonPropertyName("heaters")]
  public HeatersData? Heaters { get; set; }
}

public class HeatersData
{
  [JsonPropertyName("available_heaters")]
  public List<string>? AvailableHeaters { get; set; }

  [JsonPropertyName("available_sensors")]
  public List<string>? AvailableSensors { get; set; }

  [JsonPropertyName("available_monitors")]
  public List<string>? AvailableMonitors { get; set; }
}
