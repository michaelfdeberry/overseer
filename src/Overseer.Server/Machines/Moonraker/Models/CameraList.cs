using System.Text.Json.Serialization;

namespace Overseer.Server.Machines.Moonraker.Models;

public class CameraListResponse
{
  [JsonPropertyName("result")]
  public CameraListResult? Result { get; set; }
}

public class CameraListResult
{
  [JsonPropertyName("webcams")]
  public List<Webcam>? Webcams { get; set; }
}

public class Webcam
{
  [JsonPropertyName("name")]
  public string? Name { get; set; }

  [JsonPropertyName("enabled")]
  public bool? Enabled { get; set; }

  [JsonPropertyName("icon")]
  public string? Icon { get; set; }

  [JsonPropertyName("aspect_ratio")]
  public string? AspectRatio { get; set; }

  [JsonPropertyName("target_fps")]
  public int? TargetFps { get; set; }

  [JsonPropertyName("target_fps_idle")]
  public int? TargetFpsIdle { get; set; }

  [JsonPropertyName("location")]
  public string? Location { get; set; }

  [JsonPropertyName("service")]
  public string? Service { get; set; }

  [JsonPropertyName("stream_url")]
  public string? StreamUrl { get; set; }

  [JsonPropertyName("snapshot_url")]
  public string? SnapshotUrl { get; set; }

  [JsonPropertyName("flip_horizontal")]
  public bool? FlipHorizontal { get; set; }

  [JsonPropertyName("flip_vertical")]
  public bool? FlipVertical { get; set; }

  [JsonPropertyName("rotation")]
  public int? Rotation { get; set; }

  [JsonPropertyName("source")]
  public string? Source { get; set; }

  [JsonPropertyName("extra_data")]
  public ExtraData? ExtraData { get; set; }

  [JsonPropertyName("uid")]
  public string? Uid { get; set; }
}

public class ExtraData
{
  [JsonPropertyName("hideFps")]
  public bool? HideFps { get; set; }

  [JsonPropertyName("nozzleCrosshair")]
  public bool? NozzleCrosshair { get; set; }
}
