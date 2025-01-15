namespace Overseer.Machines.Octoprint.Models;

public class WebCam
{
  public string StreamUrl { get; set; }
  public bool FlipH { get; set; }
  public bool FlipV { get; set; }
}

public class Settings
{
  public WebCam WebCam { get; set; }
}