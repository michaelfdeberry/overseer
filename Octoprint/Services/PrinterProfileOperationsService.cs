using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class PrinterProfileOperationsService : OctoprintService
    {
        public PrinterProfileOperationsService(OctoprintOptions options) : base(options)
        {
        }

        public Task<PrinterProfileList> GetPrinterProfiles()
        {
            return Execute<PrinterProfileList>("printerprofiles", Method.GET);
        }

        public async Task<PrinterProfile> CreatePrinterProfile(PrinterProfile profile, string basedOn = null)
        {
            var response =
                await Execute<PrinterProfileResponse>("printerprofiles", Method.POST, new {profile, basedOn});
            return response.Profile;
        }

        public async Task<PrinterProfile> UpdatePrinterProfile(PrinterProfile profile)
        {
            var response =
                await Execute<PrinterProfileResponse>($"printerprofiles/{profile.Name}", Method.POST, new {profile});
            return response.Profile;
        }

        public Task DeletePrinterProfile(string printerProfileName)
        {
            return Execute($"printerprofiles/{printerProfileName}", Method.DELETE);
        }
    }
}