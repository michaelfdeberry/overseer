
namespace Overseer.Machines.RepRapFirmware.Models;

public class ConnectResponse
{
  public int Err { get; set; }
  public int SessionTimeout { get; set; }
  public string BoardType { get; set; }
  public int SessionKey { get; set; }
}