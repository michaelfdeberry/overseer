using Nancy;
using Nancy.Security;

namespace Overseer.Daemon.Modules
{
    public class ControlModule : NancyModule
    {
        public ControlModule(ControlManager controlManager)
            : base("control")
        {
            this.RequiresMSOwinAuthentication();

            Get("/{id:int}/pause", async (p, ct) => await this.OkAsync(() => controlManager.Pause(p.id)));

            Get("/{id:int}/resume", async (p, ct) => await this.OkAsync(() => controlManager.Resume(p.id)));

            Get("/{id:int}/cancel", async (p, ct) => await this.OkAsync(() => controlManager.Cancel(p.id)));

            Get("/{id:int}/feed/{value:int}", async (p, ct) => await this.OkAsync(() => controlManager.SetFeedRate(p.id, p.value)));

            Get("/{id:int}/fan/{value:int}", async (p, ct) => await this.OkAsync(() => controlManager.SetFanSpeed(p.id, p.value)));

            Get("/{id:int}/{tool}/temp/{value:int}", async (p, ct) => await this.OkAsync(() => controlManager.SetTemperature(p.id, p.tool, p.value)));            

            Get("/{id:int}/{tool}/flow/{value:int}", async (p, ct) => await this.OkAsync(() => controlManager.SetFlowRate(p.id, p.tool, p.value)));        
        }
    }
}