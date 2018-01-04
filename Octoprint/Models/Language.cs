using Newtonsoft.Json;

namespace Octoprint.Models
{
    public class Language
    {
        public string Locale { get; set; }

        [JsonProperty("locale_display")]
        public string LocaleDisplay { get; set; }

        [JsonProperty("locale_english")]
        public string LocaleEnglish { get; set; }

        [JsonProperty("last_update")]
        public string LastUpdate { get; set; }

        public string Author { get; set; }
    }
}