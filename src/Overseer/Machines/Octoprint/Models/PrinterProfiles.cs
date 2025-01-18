using System.Collections.Generic;

namespace Overseer.Machines.Octoprint.Models;

public class PrinterProfiles
{
  public Dictionary<string, Profile> Profiles { get; set; }
}

public class Profile
{
  public string Id { get; set; }
  public string Name { get; set; }
  public string Color { get; set; }
  public string Model { get; set; }
  public bool Default { get; set; }
  public bool Current { get; set; }
  public string Resource { get; set; }
  public Volume Volume { get; set; }
  public bool HeatedBed { get; set; }
  public bool HeatedChamber { get; set; }
  public Dictionary<string, Axis> Axes { get; set; }
  public Extruder Extruder { get; set; }
}

public class Volume
{
  public string FormFactor { get; set; }
  public string Origin { get; set; }
  public double Width { get; set; }
  public double Depth { get; set; }
  public double Height { get; set; }
}

public class Axis
{
  public int Speed { get; set; }
  public bool Inverted { get; set; }
}

public class Extruder
{
  public int Count { get; set; }
  public bool SharedNozzle { get; set; }
  public double NozzleDiameter { get; set; }
}

public class Offset
{
  public double X { get; set; }
  public double Y { get; set; }
}