using System.Text.Json.Serialization;

namespace Overseer.Machines.BambuLabs.Models;

public class Print
{
  [JsonPropertyName("gcode_state")]
  public string GCodeState { get; set; }

  [JsonPropertyName("cooling_fan_speed")]
  public string FanSpeed { get; set; }

  [JsonPropertyName("mc_percent")]
  public int Progress { get; set; }

  [JsonPropertyName("mc_remaining_time")]
  public int RemainingTime { get; set; }

  [JsonPropertyName("spd_mag")]
  public int Speed { get; set; }

  [JsonPropertyName("bed_temper")]
  public double BedTemperature { get; set; }

  [JsonPropertyName("bed_target_temper")]
  public double BedTargetTemperature { get; set; }

  [JsonPropertyName("nozzle_temper")]
  public double NozzleTemperature { get; set; }

  [JsonPropertyName("nozzle_target_temper")]
  public double NozzleTargetTemperature { get; set; }
}

public class Message
{
  [JsonPropertyName("print")]
  public Print Print { get; set; }
}