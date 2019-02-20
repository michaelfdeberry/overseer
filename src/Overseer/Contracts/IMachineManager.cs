using System.Collections.Generic;
using System.Threading.Tasks;
using Overseer.Models;

namespace Overseer
{
	public interface IMachineManager
	{
		Task<Machine> CreateMachine(Machine machine);
		Machine DeleteMachine(int machineId);
		Machine GetMachine(int id);
		IReadOnlyList<Machine> GetMachines();
		Task<Machine> UpdateMachine(Machine machine);
		void SortMachines(List<int> sortOrder);
	}
}