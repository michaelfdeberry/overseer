using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Updates.Patches;

class Patch20250621 : IPatch
{
  public Version Version { get; } = new Version(2, 0, 0, 0);

  public void Execute(LiteDataContext context)
  {
    var assemblyName = typeof(Patch20250621).Assembly.GetName().Name;
    var db = context.Database;
    var machineCollection = db.GetCollection(nameof(Machine));
    var machines = machineCollection.FindAll();
    foreach (var machine in machines)
    {
      var typeString = machine["_type"].AsString;
      var updateTypeName = typeString switch
      {
        var s when s.Contains(nameof(RepRapFirmwareMachine)) => typeof(RepRapFirmwareMachine).FullName,
        var s when s.Contains(nameof(OctoprintMachine)) => typeof(OctoprintMachine).FullName,
        var s when s.Contains(nameof(ElegooMachine)) => typeof(ElegooMachine).FullName,
        var s when s.Contains(nameof(BambuMachine)) => typeof(BambuMachine).FullName,
        _ => machine["_type"].AsString,
      };

      machine["_type"] = $"{updateTypeName}, {assemblyName}";

      machineCollection.Update(machine);
    }

    var valueStoreCollection = db.GetCollection(nameof(LiteValueStore.ValueRecord));
    var settingsValueRecord = valueStoreCollection.FindById(nameof(ApplicationSettings));
    settingsValueRecord["Value"]["_type"] = $"{typeof(ApplicationSettings).FullName}, {assemblyName}";
    valueStoreCollection.Update(settingsValueRecord);
  }
}
