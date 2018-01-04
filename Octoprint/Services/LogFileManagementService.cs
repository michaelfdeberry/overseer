using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class LogFileManagementService : OctoprintService
    {
        public LogFileManagementService(OctoprintOptions options) : base(options)
        {
        }

        public Task<RetrieveResponse> GetLogFiles()
        {
            return Execute<RetrieveResponse>("logs", Method.GET);
        }

        public Task DeleteLogFile(string logFileName)
        {
            return Execute($"logs/{logFileName}", Method.DELETE);
        }
    }
}