using Overseer.Data;
using Overseer.Models;
using System;

namespace Overseer.Updates.Patches
{
    public class Patch02202019 : IPatch
    {
        public Version Version { get; } = new Version(1, 0, 2, 0);

        public void Execute(LiteDataContext context)
        {
            //set the default sort indexes.
            var machineRepository = context.GetRepository<Machine>();
            var machines = machineRepository.GetAll();
            for (int i = 0; i < machines.Count; i++)
            {
                machines[i].SortIndex = i;
            }
            machineRepository.Update(machines);
        }
    }
}
