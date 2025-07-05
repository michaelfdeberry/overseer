namespace Overseer.Server.Machines.Moonraker.Models;

public class Message
{
  public string? Id { get; set; }

  public string? Method { get; set; }

  public dynamic? Params { get; set; }

  public dynamic? Result { get; set; }

  public string? Error { get; set; }
}
