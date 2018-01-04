using System.Collections.Generic;
using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class SystemService : OctoprintService
    {
        public SystemService(OctoprintOptions options) : base(options)
        {
        }

        public Task<OctoprintCommandList> GetSystemCommands()
        {
            return Execute<OctoprintCommandList>("system/commands", Method.GET);
        }

        public async Task<IReadOnlyList<OctoprintActionSettings>> GetSystemCommands(string source)
        {
            var result = await Execute<List<OctoprintActionSettings>>($"system/commands/{source}", Method.GET);
            return result.AsReadOnly();
        }

        public Task ExecuteSystemCommand(string source, string action)
        {
            return Execute($"system/commands/{source}/{action}", Method.POST);
        }
    }
}