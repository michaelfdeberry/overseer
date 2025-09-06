using System.Text.Json.Serialization;

namespace Overseer.Server.Models
{
  public class BambuMachine : Machine
  {
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public override MachineType MachineType => MachineType.Bambu;

    public string? Url { get; set; }

    public string? Serial { get; set; }

    public string? AccessCode { get; set; }
  }
}
