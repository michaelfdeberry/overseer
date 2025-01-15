using System.Text.Json.Serialization;

namespace Overseer.Machines.RepRapFirmware.Models;

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
  Idle
}

public class State
{
  public bool? AtxPower { get; set; } = null;
  public string AtxPowerPort { get; set; } = null;
  public int CurrentTool { get; set; } = -1;
  public bool? DeferredPowerDown { get; set; } = null;
  public string DisplayMessage { get; set; } = "";
  public double? LaserPwm { get; set; } = null;
  public string LogFile { get; set; } = null;
  public bool MacroRestarted { get; set; } = false;
  public long MsUpTime { get; set; } = 0;
  public int NextTool { get; set; } = -1;
  public bool PluginsStarted { get; set; } = false;
  public string PowerFailScript { get; set; } = "";
  public int PreviousTool { get; set; } = -1;
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public RRFMachineStatus Status { get; set; } = RRFMachineStatus.Starting;
  public int? ThisInput { get; set; } = null;
  public string Time { get; set; } = null;
  public long UpTime { get; set; } = 0;
}