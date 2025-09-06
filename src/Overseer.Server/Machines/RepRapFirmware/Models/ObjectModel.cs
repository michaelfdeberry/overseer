using Overseer.Server.Machines.RepRapFirmware.Models;

namespace Overseer.Machines.RepRapFirmware.Models;

public class ObjectModel
{
  public State? State { get; set; }

  public IEnumerable<Fan> Fans { get; set; } = [];

  public Heat? Heat { get; set; }

  public Job? Job { get; set; }

  public Move? Move { get; set; }

  public IEnumerable<Tool> Tools { get; set; } = [];
}
