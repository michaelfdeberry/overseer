using System.Collections.Generic;

namespace Overseer.Machines.Octoprint.Models;

public class Temperature
{
  public double? Actual { get; set; }
  public double? Target { get; set; }
  public double Offset { get; set; }
}

public class Flags
{
  public bool Operational { get; set; }
  public bool Paused { get; set; }
  public bool Printing { get; set; }
  public bool Cancelling { get; set; }
  public bool Pausing { get; set; }
  public bool SdReady { get; set; }
  public bool Error { get; set; }
  public bool Ready { get; set; }
  public bool ClosedOnError { get; set; }
  public bool Resuming { get; set; }
}

public class State
{
  public string Text { get; set; }
  public string Error { get; set; }
  public Flags Flags { get; set; } = new();
}

public class Status
{
  public Dictionary<string, Temperature> Temperature { get; set; }

  public State State { get; set; }
}