using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Overseer.Models;

namespace Overseer.Daemon.Modules
{
	public class MachinesModule : NancyModule		
	{
		public MachinesModule(IMachineManager printerManager)
			: base("machines")
		{
			this.RequiresMSOwinAuthentication();

			Get("/", p => printerManager.GetMachines());

			Get("/{id:int}", p => printerManager.GetMachine((int)p.id));

			Put("/", async p => await printerManager.CreateMachine(this.Bind<Machine>()));

			Post("/", async p => await printerManager.UpdateMachine(this.Bind<Machine>()));
			
			Delete("/{id:int}", p => printerManager.DeleteMachine((int)p.id));
		}
	}
}
