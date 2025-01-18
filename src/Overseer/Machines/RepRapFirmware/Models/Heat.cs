using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Overseer.Machines.RepRapFirmware.Models;

public enum HeaterState
{
  Off,
  Standby,
  Active,
  Fault,
  Tuning,
  Offline
}

public class Heater
{
  public double Active { get; set; } = 0;
  public double AvgPwm { get; set; } = 0;
  public double Current { get; set; } = -273.15f;
  public double Max { get; set; } = 285;
  public int MaxBadReadings { get; set; } = 3;
  public double MaxHeatingFaultTime { get; set; } = 5;
  public double MaxTempExcursion { get; set; } = 15;
  public double Min { get; set; } = -10;
  public int Sensor { get; set; } = -1;
  public double Standby { get; set; } = 0;
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public HeaterState State { get; set; } = HeaterState.Off;
}

public class Heat
{
  public IEnumerable<int> BedHeaters { get; set; }

  public IEnumerable<int> ChamberHeaters { get; set; }

  public IEnumerable<Heater> Heaters { get; set; } = [];
}