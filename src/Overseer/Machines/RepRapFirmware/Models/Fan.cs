using System.Collections.Generic;

namespace Overseer.Machines.RepRapFirmware.Models;

public class FanThermostaticControl
{
  public double? HighTemperature { get; set; } = null;
  public double? LowTemperature { get; set; } = null;
  public IEnumerable<int> Sensors { get; set; } = [];
}

public class Fan
{
  public double ActualValue { get; set; } = 0;
  public double Blip { get; set; } = 0.1f;
  public double Frequency { get; set; } = 250;
  public double Max { get; set; } = 1;
  public double Min { get; set; } = 0;
  public string Name { get; set; } = "";
  public double RequestedValue { get; set; } = 0;
  public int Rpm { get; set; } = -1;
  public FanThermostaticControl Thermostatic { get; set; } = new FanThermostaticControl();
}