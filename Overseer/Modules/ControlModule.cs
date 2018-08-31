using Nancy;
using Nancy.Security;
using Overseer.Core;

namespace Overseer.Modules
{
    public class ControlModule : NancyModule
    {
        public ControlModule(ControlManager controlManager)
            : base("control")
        {
            this.RequiresMSOwinAuthentication();

            Get["/{id:int}/pause", true] = async (p, ct) => await this.Ok(() => controlManager.Pause(p.id));

            Get["/{id:int}/resume", true] = async (p, ct) => await this.Ok(() => controlManager.Resume(p.id));

            Get["/{id:int}/cancel", true] = async (p, ct) => await this.Ok(() => controlManager.Cancel(p.id));

            Get["/{id:int}/feed/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetFeedRate(p.id, p.value));

            Get["/{id:int}/fan/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetFanSpeed(p.id, p.value));

            Get["/{id:int}/{tool}/temp/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetTemperature(p.id, p.tool, p.value));            

            Get["/{id:int}/{tool}/flow/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetFlowRate(p.id, p.tool, p.value));        
        }
    }
}