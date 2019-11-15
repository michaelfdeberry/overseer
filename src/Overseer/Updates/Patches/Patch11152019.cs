using Overseer.Data;
using Overseer.Models;
using System;
using System.Linq;

namespace Overseer.Updates.Patches
{
    class Patch11152019 : IPatch
    {
        public Version Version { get; } = new Version(1, 0, 16, 0);

        public void Execute(LiteDataContext context)
        {
            var db = context.Database;

            if (!db.CollectionExists(nameof(Machine))) return;

            var machines = db.GetCollection(nameof(Machine)).FindAll().ToList();
            foreach (var machine in machines)
            {
                //correct the profile property name to match UI
                if (machine["MachineType"].AsInt32 == (int)MachineType.Octoprint)
                {
                    machine["Profile"] = machine["ProfileName"];
                    machine.Remove("ProfileName");
                }
            }
        }
    }
}
