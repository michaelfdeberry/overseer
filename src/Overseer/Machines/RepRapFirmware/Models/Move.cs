using System.Collections.Generic;

namespace Overseer.Machines.RepRapFirmware.Models;

public class Extruder
{
  public double Acceleration { get; set; }
  public double Current { get; set; }
  public string Filament { get; set; }
  public double FilamentDiameter { get; set; }
  public double Factor { get; set; }
  public double Jerk { get; set; }
  public double PercentCurrent { get; set; }
  public double Position { get; set; }
  public double PressureAdvance { get; set; }
  public double RawPosition { get; set; }
  public double Speed { get; set; }
  public double StepsPerMm { get; set; }
}

public class Move
{
  public List<Extruder> Extruders { get; }
  public bool LimitAxes { get; set; }
  public bool NoMovesBeforeHoming { get; set; }
  public double PrintingAcceleration { get; set; }
  public double SpeedFactor { get; set; }
  public double TravelAcceleration { get; set; }
  public double VirtualEPos { get; set; }
  public int WorkplaceNumber { get; set; }
}
