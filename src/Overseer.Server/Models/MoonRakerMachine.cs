using System.Text.Json.Serialization;

namespace Overseer.Server.Models;

public class MoonrakerMachine : Machine, IWebSocketMachine
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public override MachineType MachineType => MachineType.Moonraker;

  public string? IpAddress { get; set; }

  public int? Port { get; set; }

  public string? Url { get; set; }

  public Dictionary<string, string> AvailableWebCams { get; set; } = [];

  public Uri? WebSocketUri { get; set; }
}
