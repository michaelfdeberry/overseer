using Nancy;
using Nancy.IO;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;

namespace Overseer.Startup.Json
{
    /// <summary>
    /// Based on code from https://github.com/NancyFx/Nancy.Serialization.JsonNet
    /// </summary>
    public class JsonNetSerializer : ISerializer
    {
        readonly JsonSerializer _serializer;
        
        public JsonNetSerializer()
        {
            _serializer = JsonSerializer.CreateDefault();
        }
        
        public JsonNetSerializer(JsonSerializer serializer)
        {
            _serializer = serializer;
        }
        
        public bool CanSerialize(string contentType)
        {
            return Helpers.IsJsonType(contentType);
        }

        public void Serialize<TModel>(string contentType, TModel model, Stream outputStream)
        {
            using (var writer = new JsonTextWriter(new StreamWriter(new UnclosableStreamWrapper(outputStream))))
            {
                _serializer.Serialize(writer, model);
            }
        }
        
        public IEnumerable<string> Extensions
        {
            get { yield return "json"; }
        }
    }
}
