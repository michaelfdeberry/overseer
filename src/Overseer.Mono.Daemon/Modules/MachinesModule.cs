using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Overseer.Models;
using System.Collections.Generic;

namespace Overseer.Daemon.Modules
{
	public class MachinesModule : NancyModule		
	{
		public MachinesModule(IMachineManager machineManager)
			: base("machines")
		{
			this.RequiresMSOwinAuthentication();

			Get("/", p => machineManager.GetMachines());

			Get("/{id:int}", p => machineManager.GetMachine((int)p.id));

			Put("/", async p => await machineManager.CreateMachine(this.Bind<Machine>()));

			Post("/", async p => await machineManager.UpdateMachine(this.Bind<Machine>()));
			
			Delete("/{id:int}", p => machineManager.DeleteMachine((int)p.id));

			Post("/sort", p => this.Ok(() => machineManager.SortMachines(this.Bind<List<int>>())));
		}
	}
}
