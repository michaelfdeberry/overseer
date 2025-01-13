using System.Text.Json.Serialization;

namespace Overseer.Models
{
  public class RepRapFirmwareMachine : Machine, IPollingMachine
  {
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public override MachineType MachineType => MachineType.RepRapFirmware;

    public bool RequiresPassword { get; set; }

    public string Password { get; set; }

    public string Url { get; set; }

    public string ClientCertificate { get; set; }
  }
}