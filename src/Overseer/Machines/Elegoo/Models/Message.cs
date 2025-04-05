namespace Overseer.Machines.Elegoo.Models;

// TODO: figure out the values and what they mean. These aren't correct
public enum ElegooMachineState
{
  Pausing = 5,
  Paused = 6,
  Printing = 13,
  Resuming = 20,
}

public class PrintInfo
{
  public int Status { get; set; }
  public int CurrentLayer { get; set; }
  public int TotalLayers { get; set; }
  public decimal CurrentTicks { get; set; }
  public decimal TotalTicks { get; set; }
  public int PrintSpeedPct { get; set; }
  public int Progress { get; set; }
}

public class FanInfo
{
  public int ModelFan { get; set; }
  public int AuxiliaryFan { get; set; }
  public int BoxFan { get; set; }
}

public class Status
{
  public int[] CurrentStatus { get; set; }
  public int TimeLapseStatus { get; set; }
  public int PlatFormType { get; set; }
  public double TempOfHotbed { get; set; }
  public double TempOfNozzle { get; set; }
  public double TempOfBox { get; set; }
  public int TempTargetHotbed { get; set; }
  public int TempTargetNozzle { get; set; }
  public int TempTargetBox { get; set; }
  public string CurrenCoord { get; set; }
  public FanInfo CurrentFanSpeed { get; set; }
  public PrintInfo PrintInfo { get; set; }
}

public class Message
{
  public Status Status { get; set; }
  public string MainboardID { get; set; }
  public long Timestamp { get; set; }
  public string Topic { get; set; }
}