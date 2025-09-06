using System.Text.Json.Serialization;

namespace Overseer.Server.Machines.RepRapFirmware.Models;

public enum RRFMachineStatus
{
  Disconnected,
  Starting,
  Updating,
  Off,
  Halted,
  Pausing,
  Paused,
  Resuming,
  Cancelling,
  Processing,
  Simulating,
  Busy,
  ChangingTool,
  Idle,
}

public class State
{
  public bool? AtxPower { get; set; }
  public string? AtxPowerPort { get; set; }
  public int CurrentTool { get; set; }
  public bool? DeferredPowerDown { get; set; }
  public string? DisplayMessage { get; set; }
  public double? LaserPwm { get; set; }
  public string? LogFile { get; set; }
  public bool MacroRestarted { get; set; }
  public long MsUpTime { get; set; }
  public int NextTool { get; set; }
  public bool PluginsStarted { get; set; }
  public string? PowerFailScript { get; set; }
  public int PreviousTool { get; set; }

  [JsonConverter(typeof(JsonStringEnumConverter))]
  public RRFMachineStatus? Status { get; set; }
  public int? ThisInput { get; set; }
  public string? Time { get; set; }
  public long UpTime { get; set; }
}
