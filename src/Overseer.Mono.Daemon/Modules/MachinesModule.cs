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

            Get("/", p => 
            {
                return machineManager.GetMachines();
            });

            Get("/{id:int}", p => 
            {                
                return machineManager.GetMachine((int)p.id);
            });

            Put("/", async p => 
            {
                this.RequireAdmin();

                return await machineManager.CreateMachine(this.Bind<Machine>());
            });

            Post("/", async p => 
            {
                this.RequireAdmin();

                return await machineManager.UpdateMachine(this.Bind<Machine>());
            });
            
            Delete("/{id:int}", p => 
            {
                this.RequireAdmin();

                return machineManager.DeleteMachine((int)p.id);
            });

            Post("/sort", p => 
            {
                this.RequireAdmin();

                machineManager.SortMachines(this.Bind<List<int>>());
                return HttpStatusCode.OK;
            });
        }
    }
}
