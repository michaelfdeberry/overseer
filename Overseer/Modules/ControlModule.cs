using Nancy;
using Overseer.Core;

namespace Overseer.Modules
{
    public class ControlModule : NancyModule
    {
        public ControlModule(ControlManager controlManager)
            : base("services/control")
        {
            Get["/{id:int}/pause", true] = async (p, ct) => await this.Ok(() => controlManager.Pause(p.id));

            Get["/{id:int}/resume", true] = async (p, ct) => await this.Ok(() => controlManager.Resume(p.id));

            Get["/{id:int}/cancel", true] = async (p, ct) => await this.Ok(() => controlManager.Cancel(p.id));

            Get["/{id:int}/temp/{tool}/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetTemperature(p.id, p.tool, p.value));

            Get["/{id:int}/feed/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetFeedRate(p.id, p.value));

            Get["/{id:int}/flow/{tool}/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetFlowRate(p.id, p.tool, p.value));

            Get["/{id:int}/fan/{value:int}", true] = async (p, ct) => await this.Ok(() => controlManager.SetFanSpeed(p.id, p.value));
        }
    }
}