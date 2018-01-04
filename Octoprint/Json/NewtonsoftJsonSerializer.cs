using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RestSharp.Serializers;
using JsonSerializer = Newtonsoft.Json.JsonSerializer;

namespace Octoprint.Json
{
    public class NewtonsoftJsonSerializer : ISerializer
    {
        readonly JsonSerializer _serializer;

        public NewtonsoftJsonSerializer()
        {
            ContentType = "application/json";
            _serializer = new JsonSerializer
            {
                MissingMemberHandling = MissingMemberHandling.Ignore,
                NullValueHandling = NullValueHandling.Include,
                DefaultValueHandling = DefaultValueHandling.Include,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
        }

        public string Serialize(object obj)
        {
            using (var stringWriter = new StringWriter())
            using (var jsonTextWriter = new JsonTextWriter(stringWriter))
            {
                jsonTextWriter.Formatting = Formatting.Indented;
                jsonTextWriter.QuoteChar = '"';

                _serializer.Serialize(jsonTextWriter, obj);

                return stringWriter.ToString();
            }
        }

        public string DateFormat { get; set; }


        public string RootElement { get; set; }

        public string Namespace { get; set; }

        public string ContentType { get; set; }
    }
}