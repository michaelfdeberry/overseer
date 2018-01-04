using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class TimelapseService : OctoprintService
    {
        public TimelapseService(OctoprintOptions options) : base(options)
        {
        }

        public Task GetTimelapseDetails(bool includeUnrendered)
        {
            var request = CreateRequest("timelapse", Method.GET);
            if (includeUnrendered)
                request.AddQueryParameter("unrendered", "true");

            return Execute<TimeLapseDetails>(request);
        }

        public Task DeleteTimelapse(string fileName)
        {
            return Execute($"timelapse/{fileName}", Method.DELETE);
        }

        public Task RenderTimelapse(string fileName)
        {
            return Execute($"timelapse/unrendered/{fileName}", Method.POST, new {command = "render"});
        }

        public Task DeleteUnrenderedTimelapse(string fileName)
        {
            return Execute($"timelapse/unrendered/{fileName}", Method.DELETE);
        }

        public Task UpdateTimelapseConfig(TimelapseConfig config)
        {
            return Execute("timelapse", Method.POST, config);
        }
    }
}