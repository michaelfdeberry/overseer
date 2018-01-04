using System.Collections.Generic;
using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class LanguagesService : OctoprintService
    {
        public LanguagesService(OctoprintOptions options) : base(options)
        {
        }

        public Task<LangaugePacks> GetLanguagePacks()
        {
            return Execute<LangaugePacks>(CreateRequest("languages", Method.GET));
        }

        public Task<Dictionary<string, LanguagePack>> DeleteLanguagePack(string locale, string packName)
        {
            return Execute<Dictionary<string, LanguagePack>>($"{locale}/{packName}", Method.DELETE);
        }
    }
}