using System.Text.Json.Serialization;

namespace Overseer.Server.Machines.RepRapFirmware.Models;

public enum HeaterState
{
  Off,
  Standby,
  Active,
  Fault,
  Tuning,
  Offline,
}

public class Heater
{
  public double Active { get; set; }
  public double AvgPwm { get; set; }
  public double Current { get; set; }
  public double Max { get; set; }
  public int MaxBadReadings { get; set; }
  public double MaxHeatingFaultTime { get; set; }
  public double MaxTempExcursion { get; set; }
  public double Min { get; set; }
  public int Sensor { get; set; }
  public double Standby { get; set; }

  [JsonConverter(typeof(JsonStringEnumConverter))]
  public HeaterState State { get; set; }
}

public class Heat
{
  public IEnumerable<int> BedHeaters { get; set; } = [];

  public IEnumerable<int> ChamberHeaters { get; set; } = [];

  public IEnumerable<Heater> Heaters { get; set; } = [];
}
