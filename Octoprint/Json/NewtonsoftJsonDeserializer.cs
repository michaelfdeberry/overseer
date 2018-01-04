using System.IO;
using Newtonsoft.Json;
using RestSharp;
using RestSharp.Deserializers;

namespace Octoprint.Json
{
    public class NewtonsoftJsonDeserializer : IDeserializer
    {
        readonly JsonSerializer _serializer;

        public NewtonsoftJsonDeserializer()
        {
            _serializer = new JsonSerializer
            {
                MissingMemberHandling = MissingMemberHandling.Ignore,
                NullValueHandling = NullValueHandling.Include,
                DefaultValueHandling = DefaultValueHandling.Include
            };
        }

        public T Deserialize<T>(IRestResponse response)
        {
            var content = response.Content;

            using (var stringReader = new StringReader(content))
            {
                using (var jsonTextReader = new JsonTextReader(stringReader))
                {
                    return _serializer.Deserialize<T>(jsonTextReader);
                }
            }
        }

        public string RootElement { get; set; }
        public string Namespace { get; set; }
        public string DateFormat { get; set; }
    }
}