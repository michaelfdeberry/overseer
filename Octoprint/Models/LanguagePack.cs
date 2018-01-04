using System.Collections.Generic;
using Newtonsoft.Json;

namespace Octoprint.Models
{
    public class LangaugePacks
    {
        [JsonProperty("language_packs")]
        public Dictionary<string, LanguagePack> LanguagePacks { get; set; }
    }

    public class LanguagePack
    {
        public string Identifier { get; set; }

        public string Display { get; set; }

        public IEnumerable<Language> Languages { get; set; }
    }
}