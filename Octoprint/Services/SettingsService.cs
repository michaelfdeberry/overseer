using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class SettingsService : OctoprintService
    {
        public SettingsService(OctoprintOptions options) : base(options)
        {
        }

        public Task<OctoprintSettings> GetSettings()
        {
            return Execute<OctoprintSettings>("settings", Method.GET);
        }

        public Task<OctoprintSettings> UpdateSettings(OctoprintSettings settings)
        {
            return Execute<OctoprintSettings>("settings", Method.POST, settings);
        }

        public async Task<string> ResetApiKey()
        {
            var result = await Execute<OctoprintApiKeyRefreshResult>("settings/apikey", Method.POST);
            return result.ApiKey;
        }
    }
}