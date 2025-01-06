using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Overseer.Models
{
  public class OctoprintMachine : Machine, IPollingMachine
  {
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public override MachineType MachineType => MachineType.Octoprint;

    public string ApiKey { get; set; }

    public string Profile { get; set; }

    public Dictionary<string, string> AvailableProfiles { get; set; } = [];

    public string Url { get; set; }

    public string ClientCertificate { get; set; }

  }
}