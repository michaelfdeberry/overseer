using System.Text.Json.Serialization;

namespace Overseer.Server.Models;

public class DuetSoftwareFrameworkMachine : Machine, IWebSocketMachine
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public override MachineType MachineType => MachineType.DuetSoftwareFramework;

  public bool RequiresPassword { get; set; }

  public string? Password { get; set; }

  public string? Url { get; set; }

  public string? ClientCertificate { get; set; }

  public Uri? WebSocketUri { get; set; }
}
