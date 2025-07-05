namespace Overseer.Server.Machines.RepRapFirmware.Models;

public class ModelResponse<T>
{
  public string? Key { get; set; }

  public string? Flags { get; set; }

  public T? Result { get; set; }
}
