using Microsoft.AspNetCore.Mvc;
using Overseer.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Overseer.Daemon.Controllers
{
	[Route("[controller]")]
	public class MachinesController : Controller
	{
		readonly IMachineManager _machineManager;

		public MachinesController(IMachineManager machineManager)
		{
			_machineManager = machineManager;
		}
		
		[HttpGet]
		public ActionResult<List<Machine>> GetMachines()
		{
			return _machineManager.GetMachines().ToList();
		}
		
		[HttpPut]
		public async Task<ActionResult<Machine>> CreatePrinter([FromBody]Machine machine)
		{
			return await _machineManager.CreateMachine(machine);
		}
		
		[HttpPost]
		public async Task<ActionResult<Machine>> UpdatePrinter([FromBody]Machine machine)
		{
			return await _machineManager.UpdateMachine(machine);
		}

		[HttpGet("{machineId:int}")]
		public ActionResult<Machine> GetMachine(int machineId)
		{
			return _machineManager.GetMachine(machineId);
		}

		[HttpDelete("{machineId:int}")]
		public ActionResult DeletePrinter(int machineId)
		{
			_machineManager.DeleteMachine(machineId);
			return Ok();
		}
	}
}
