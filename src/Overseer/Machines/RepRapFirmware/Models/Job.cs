using System.Collections.Generic;

namespace Overseer.Machines.RepRapFirmware.Models;

public class Layer
{
  public int Duration { get; set; } = 0;
  public List<int> Filament { get; set; } = [];
  public int FractionPrinted { get; set; } = 0;
  public int Height { get; set; } = 0;
  public List<int> Temperatures { get; set; } = [];
}

public class TimesLeft
{
  public int? Filament { get; set; } = null;
  public int? File { get; set; } = null;
  public int? Slicer { get; set; } = null;
}

public class GCodeFileInfo
{
  public List<double> Filament { get; set; } = [];
  public string FileName { get; set; } = "";
  public string GeneratedBy { get; set; } = "";
  public double Height { get; set; } = 0;
  public string LastModified { get; set; } = null;
  public double LayerHeight { get; set; } = 0;
  public int NumLayers { get; set; } = 0;
  public int? PrintTime { get; set; } = null;
  public int? SimulatedTime { get; set; } = null;
  public int Size { get; set; } = 0;
}

public class Job
{
  public int? Duration { get; set; } = null;
  public GCodeFileInfo File { get; set; } = null;
  public int? FilePosition { get; set; } = null;
  public int? LastDuration { get; set; } = null;
  public string LastFileName { get; set; } = null;
  public bool LastFileAborted { get; set; } = false;
  public bool LastFileCancelled { get; set; } = false;
  public bool LastFileSimulated { get; set; } = false;
  public int? LastWarmUpDuration { get; set; } = null;
  public int? Layer { get; set; } = null;
  public List<Layer> Layers { get; } = [];
  public double? LayerTime { get; set; } = null;
  public double? PauseDuration { get; set; } = null;
  public double? RawExtrusion { get; set; } = null;
  public TimesLeft TimesLeft { get; } = new TimesLeft();
  public double? WarmUpDuration { get; set; } = null;
}
