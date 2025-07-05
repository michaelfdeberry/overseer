using System.Text.Json.Serialization;

namespace Overseer.Server.Models
{
  public enum MachineState
  {
    Offline = 0,
    Idle = 1,
    Paused = 2,
    Operational = 3,
  }

  public class TemperatureStatus
  {
    public int HeaterIndex { get; set; }

    public double Actual { get; set; }

    public double Target { get; set; }
  }

  public class MachineStatus
  {
    /// <summary>
    /// The id of the configured machine that this status is for
    /// </summary>
    public int MachineId { get; set; }

    /// <summary>
    /// The current state of the machine
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MachineState State { get; set; }

    /// <summary>
    /// The total amount of time the machine has been operational
    /// </summary>
    public int ElapsedJobTime { get; set; }

    /// <summary>
    /// The estimated time remaining for a job
    /// </summary>
    /// <remarks>
    public int EstimatedTimeRemaining { get; set; }

    /// <summary>
    /// The percentage of completion
    /// </summary>
    public double Progress { get; set; }

    /// <summary>
    /// The current speed of the fan
    /// </summary>
    public double FanSpeed { get; set; }

    /// <summary>
    /// The current feed rate of the operation
    /// </summary>
    public double FeedRate { get; set; }

    /// <summary>
    /// The current flow rates for each extruder
    /// </summary>
    public Dictionary<int, double> FlowRates { get; set; } = [];

    /// <summary>
    /// The current temperatures for each heater
    /// </summary>
    public Dictionary<int, TemperatureStatus> Temperatures { get; set; } = [];

    public override bool Equals(object? obj)
    {
      if (obj is not MachineStatus other)
        return false;

      return MachineId == other.MachineId
        && State == other.State
        && ElapsedJobTime == other.ElapsedJobTime
        && EstimatedTimeRemaining == other.EstimatedTimeRemaining
        && Progress.Equals(other.Progress)
        && FanSpeed.Equals(other.FanSpeed)
        && FeedRate.Equals(other.FeedRate)
        && FlowRates.SequenceEqual(other.FlowRates)
        && Temperatures.SequenceEqual(other.Temperatures);
    }

    public override int GetHashCode()
    {
      unchecked
      {
        int hash = 17;
        hash = hash * 23 + MachineId.GetHashCode();
        hash = hash * 23 + State.GetHashCode();
        hash = hash * 23 + ElapsedJobTime.GetHashCode();
        hash = hash * 23 + EstimatedTimeRemaining.GetHashCode();
        hash = hash * 23 + Progress.GetHashCode();
        hash = hash * 23 + FanSpeed.GetHashCode();
        hash = hash * 23 + FeedRate.GetHashCode();
        foreach (var kvp in FlowRates)
        {
          hash = hash * 23 + kvp.Key.GetHashCode();
          hash = hash * 23 + kvp.Value.GetHashCode();
        }
        foreach (var kvp in Temperatures)
        {
          hash = hash * 23 + kvp.Key.GetHashCode();
          hash = hash * 23 + (kvp.Value?.GetHashCode() ?? 0);
        }
        return hash;
      }
    }
  }
}
