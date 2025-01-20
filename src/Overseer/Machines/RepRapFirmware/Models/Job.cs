using System.Collections.Generic;

namespace Overseer.Machines.RepRapFirmware.Models;

public class Layer
{
  public int Duration { get; set; }
  public List<int> Filament { get; set; }
  public int FractionPrinted { get; set; }
  public int Height { get; set; }
  public List<int> Temperatures { get; set; }
}

public class TimesLeft
{
  public int? Filament { get; set; };
  public int? File { get; set; };
  public int? Slicer { get; set; };
}

public class GCodeFileInfo
{
  public List<double> Filament { get; set; }
  public string FileName { get; set; }
  public string GeneratedBy { get; set; }
  public double Height { get; set; }
  public string LastModified { get; set; }
  public double LayerHeight { get; set; }
  public int NumLayers { get; set; }
  public int? PrintTime { get; set; }
  public int? SimulatedTime { get; set; }
  public int Size { get; set; }
}

public class Job
{
  public int? Duration { get; set; }
  public GCodeFileInfo File { get; set; }
  public int? FilePosition { get; set; }
  public int? LastDuration { get; set; }
  public string LastFileName { get; set; }
  public bool? LastFileAborted { get; set; }
  public bool? LastFileCancelled { get; set; }
  public bool? LastFileSimulated { get; set; }
  public int? LastWarmUpDuration { get; set; }
  public int? Layer { get; set; }
  public List<Layer> Layers { get; }
  public double? LayerTime { get; set; }
  public double? PauseDuration { get; set; }
  public double? RawExtrusion { get; set; }
  public TimesLeft TimesLeft { get; set; }
  public double? WarmUpDuration { get; set; }
}
