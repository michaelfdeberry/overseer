using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

using Overseer.Data;

namespace Overseer.Models
{
  [JsonDerivedType(typeof(BambuMachine))]
  [JsonDerivedType(typeof(ElegooMachine))]
  [JsonDerivedType(typeof(OctoprintMachine))]
  [JsonDerivedType(typeof(RepRapFirmwareMachine))]
  public abstract class Machine : IEntity
  {
    static readonly Lazy<ConcurrentDictionary<MachineType, Type>> _machineTypeMap = new(() =>
    {
      var mapping = typeof(Machine).GetAssignableTypes()
        .ToDictionary(type => ((Machine)Activator.CreateInstance(type)).MachineType);

      return new ConcurrentDictionary<MachineType, Type>(mapping);
    });

    public int Id { get; set; }

    public string Name { get; set; }

    public bool Disabled { get; set; }

    public string WebCamUrl { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public WebCamOrientation WebCamOrientation { get; set; }

    public IEnumerable<MachineTool> Tools { get; set; } = new List<MachineTool>();

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public abstract MachineType MachineType { get; }

    public int SortIndex { get; set; }

    public static Type GetMachineType(string machineTypeName)
    {
      var machineType = (MachineType)Enum.Parse(typeof(MachineType), machineTypeName, ignoreCase: true);
      if (_machineTypeMap.Value.TryGetValue(machineType, out Type type)) return type;

      throw new InvalidOperationException("Invalid Machine Type");
    }
  }
}