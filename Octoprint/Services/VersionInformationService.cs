using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class VersionInformationService : OctoprintService
    {
        public VersionInformationService(OctoprintOptions options)
            : base(options)
        {
        }

        public Task<VersionDetails> GetDetails()
        {
            return Execute<VersionDetails>("version", Method.GET);
        }
    }
}