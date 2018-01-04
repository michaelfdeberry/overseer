using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class JobOperationsService : OctoprintService
    {
        public JobOperationsService(OctoprintOptions options) : base(options)
        {
        }

        public Task<JobStatus> GetJobStatus()
        {
            return Execute<JobStatus>("job", Method.GET);
        }

        public Task Start()
        {
            return Command("start");
        }

        public Task Cancel()
        {
            return Command("cancel");
        }

        public Task Restart()
        {
            return Command("restart");
        }

        public Task Pause()
        {
            return Command("pause", "pause");
        }

        public Task Resume()
        {
            return Command("pause", "resume");
        }

        public Task Toggle()
        {
            return Command("pause", "toggle");
        }

        Task Command(string command, string action = null)
        {
            return Execute("job", Method.POST, new {command, action});
        }
    }
}