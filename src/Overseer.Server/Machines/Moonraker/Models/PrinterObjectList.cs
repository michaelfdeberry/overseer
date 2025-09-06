namespace Overseer.Server.Machines.Moonraker.Models;

public class PrinterObjectList
{
  public List<string> Objects { get; set; } = [];
}

public class PrinterObjectListResponse
{
  public PrinterObjectList? Result { get; set; }
}
