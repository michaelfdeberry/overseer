using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Overseer.Core.Models;

namespace Overseer.Startup
{
    public class PrinterConfigJsonConverter : JsonConverter
    {
        static readonly JsonSerializerSettings SerializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new PrinterConfigContractResovler()
        };

        public override bool CanWrite => false;

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue,
            JsonSerializer serializer)
        {
            var jsonObject = JObject.Load(reader);
            var printerTypeName = jsonObject["printerType"].Value<string>();
            var printerType = (PrinterType)Enum.Parse(typeof(PrinterType), printerTypeName, ignoreCase: true);
            var configType = PrinterConfig.GetConfigType(printerType);

            return JsonConvert.DeserializeObject(jsonObject.ToString(), configType, SerializerSettings);
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(PrinterConfig);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public class PrinterConfigContractResovler : DefaultContractResolver
        {
            protected override JsonConverter ResolveContractConverter(Type objectType)
            {
                if (typeof(PrinterConfig).IsAssignableFrom(objectType) && !objectType.IsAbstract)
                    return null;

                return base.ResolveContractConverter(objectType);
            }
        }
    }
}