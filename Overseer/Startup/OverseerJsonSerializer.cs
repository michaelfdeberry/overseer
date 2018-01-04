using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Overseer.Startup
{
    /// <summary>
    ///     Sets up the Json.Net Serializer that will be used with Nancy
    /// </summary>
    public class OverseerJsonSerializer : JsonSerializer
    {
        public OverseerJsonSerializer()
        {
            ContractResolver = new OverseerContractResolver();
            Converters.Add(new StringEnumConverter());
            Converters.Add(new PrinterConfigJsonConverter());
            Formatting = Formatting.None;
        }
    }
}