using System.Text.Json.Serialization;

namespace Overseer.Server.Machines.RepRapFirmware.Models;

public enum ToolState
{
  Off,
  Active,
  Standby,
}

public class Tool
{
  public IEnumerable<double> Active { get; set; } = [];
  public IEnumerable<IEnumerable<int>> Axes { get; set; } = [];
  public IEnumerable<int> Extruders { get; set; } = [];
  public IEnumerable<int> Fans { get; set; } = [];
  public IEnumerable<int> FeedForward { get; set; } = [];
  public int FilamentExtruder { get; set; } = -1;
  public IEnumerable<int> Heaters { get; set; } = [];
  public bool IsRetracted { get; set; } = false;
  public IEnumerable<double> Mix { get; set; } = [];
  public string Name { get; set; } = string.Empty;
  public int Number { get; set; } = 0;
  public IEnumerable<int> Offsets { get; set; } = [];
  public int OffsetsProbed { get; set; }
  public int Spindle { get; set; } = -1;
  public int SpindleRpm { get; set; } = 0;
  public IEnumerable<double> Standby { get; set; } = [];

  [JsonConverter(typeof(JsonStringEnumConverter))]
  public ToolState State { get; set; } = ToolState.Off;
}
