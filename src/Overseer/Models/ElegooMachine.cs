using System.Text.Json.Serialization;

namespace Overseer.Models;

public class ElegooMachine : Machine
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public override MachineType MachineType => MachineType.Elegoo;

  public string IpAddress { get; set; }

  public string Url { get; set; }
}