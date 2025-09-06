﻿using Overseer.Server.Models;

namespace Overseer.Server.Machines
{
  public interface IMachineManager
  {
    IEnumerable<string> GetMachineTypes();
    Task<Machine> CreateMachine(Machine machine);
    Machine? DeleteMachine(int machineId);
    Machine GetMachine(int id);
    IReadOnlyList<Machine> GetMachines();
    Task<Machine> UpdateMachine(Machine machine);
    void SortMachines(List<int> sortOrder);
  }
}
