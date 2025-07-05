using System.Text.Json.Serialization;

namespace Overseer.Server.Models;

public class ElegooMachine : Machine, IWebSocketMachine
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public override MachineType MachineType => MachineType.Elegoo;

  public string? IpAddress { get; set; }

  public string? Url { get; set; }
  public Uri? WebSocketUri { get; set; }
}
