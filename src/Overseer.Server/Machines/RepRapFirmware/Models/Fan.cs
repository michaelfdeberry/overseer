namespace Overseer.Server.Machines.RepRapFirmware.Models;

public class FanThermostaticControl
{
  public double? HighTemperature { get; set; }
  public double? LowTemperature { get; set; }
  public IEnumerable<int> Sensors { get; set; } = [];
}

public class Fan
{
  public double ActualValue { get; set; }
  public double Blip { get; set; }
  public double Frequency { get; set; }
  public double Max { get; set; }
  public double Min { get; set; }
  public string? Name { get; set; }
  public double RequestedValue { get; set; }
  public int Rpm { get; set; }
  public FanThermostaticControl? Thermostatic { get; set; }
}
