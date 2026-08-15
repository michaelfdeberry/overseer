using System.Text.Json.Serialization;

namespace Overseer.Server.Models;

public enum InitializationState
{
  /// <summary>
  /// Specifies that the system is fully initialized and ready for use.
  /// </summary>
  Initialized = 0,

  /// <summary>
  /// Specifies that the system requires an administrator to be set up before it can be used.
  /// </summary>
  Admin = 1,

  /// <summary>
  /// Specifies that the system requires machine plugins to be configured before it can be used.
  /// </summary>
  Plugins = 2,

  /// <summary>
  /// Specifies that the system requires machines to be configured before it can be used.
  /// </summary>
  Machines = 3,
}

public class InitializationStatus
{
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public InitializationState State { get; set; }

  public UserDisplay? User { get; set; }
}
