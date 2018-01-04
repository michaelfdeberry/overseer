using System.Collections.Generic;
using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class PrinterOperationsService : OctoprintService
    {
        public PrinterOperationsService(OctoprintOptions options) : base(options)
        {
        }

        public Task<PrinterState> GetPrinterState()
        {
            return Execute<PrinterState>("printer", Method.GET);
        }

        public Task Jog(int? x = null, int? y = null, int? z = null, bool? absolute = false, int? speed = null)
        {
            if (!x.HasValue && !y.HasValue && !z.HasValue) return Task.FromResult(false);

            return Execute("printer/printhead", Method.POST, new {command = "jog", x, y, z, absolute, speed});
        }

        public Task Home(bool x = false, bool y = false, bool z = false)
        {
            if (!x && !y && !z) return Task.FromResult<object>(null);

            var axes = new List<string>();
            if (x) axes.Add("x");
            if (y) axes.Add("y");
            if (z) axes.Add("z");

            return Execute("printer/printhead", Method.POST, new {command = "home", axes});
        }

        public Task Feedrate(int factor)
        {
            if (factor < 50 || factor > 200) return Task.FromResult(false);

            return Execute("printer/printhead", Method.POST, new {command = "feedrate", factor});
        }

        public Task SetToolTarget(string tool, float target)
        {
            return Execute("printer/tool", Method.POST,
                new {command = "target", targets = new Dictionary<string, object> {{tool, target}}});
        }

        public Task SetToolOffset(string tool, float offset)
        {
            return Execute("printer/tool", Method.POST,
                new {command = "offset", offsets = new Dictionary<string, object> {{tool, offset}}});
        }

        public async Task Extrude(string tool, float amount)
        {
            await SelectTool(tool);

            await Execute("printer/tool", Method.POST, new {command = "extrude", amount});
        }

        public Task Retract(string tool, float amount)
        {
            return Extrude(tool, -amount);
        }

        public async Task Flowrate(string tool, int factor)
        {
            await SelectTool(tool);

            await Execute("printer/tool", Method.POST, new {command = "flowrate", factor});
        }

        Task SelectTool(string tool)
        {
            return Execute("printer/tool", Method.POST, new {command = "select", tool});
        }

        public Task<Dictionary<string, Temperature>> GetToolState()
        {
            return Execute<Dictionary<string, Temperature>>("printer/tool", Method.GET);
        }

        public Task SetBedTarget(float target)
        {
            return Execute("printer/bed", Method.POST, new {command = "target", target});
        }

        public Task SetBedOffset(float offset)
        {
            return Execute("printer/bed", Method.POST, new {command = "offset", offset});
        }

        public Task<Dictionary<string, Temperature>> GetBedState()
        {
            return Execute<Dictionary<string, Temperature>>("printer/bed", Method.GET);
        }

        public Task InitSdCard()
        {
            return Execute("printer/sd", Method.POST, new {command = "init"});
        }

        public Task RefreshSdCard()
        {
            return Execute("printer/sd", Method.POST, new {command = "refresh"});
        }

        public Task ReleaseSdCard()
        {
            return Execute("printer/sd", Method.POST, new {command = "release"});
        }

        public Task<SdState> GetSdCardState()
        {
            return Execute<SdState>("printer/sd", Method.GET);
        }

        public Task SendCommand(string command)
        {
            return Execute("printer/command", Method.POST, new {command});
        }

        public Task SendCommands(IEnumerable<string> commands)
        {
            return Execute("printer/command", Method.POST, new {commands});
        }
    }
}