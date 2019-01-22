using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Overseer.Models;
using System;

namespace Overseer.Daemon.Bootstrapping
{
    public class MachineJsonConverter : JsonConverter
    {
        static readonly JsonSerializerSettings SerializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new PrinterConfigContractResovler()
        };

        public override bool CanWrite => false;

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var jsonObject = JObject.Load(reader);
            var machineType = Machine.GetMachineType(jsonObject["machineType"].Value<string>());
            return JsonConvert.DeserializeObject(jsonObject.ToString(), machineType, SerializerSettings);
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(Machine);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public class PrinterConfigContractResovler : DefaultContractResolver
        {
            protected override JsonConverter ResolveContractConverter(Type objectType)
            {
                if (typeof(Machine).IsAssignableFrom(objectType) && !objectType.IsAbstract)
                    return null;

                return base.ResolveContractConverter(objectType);
            }
        }
    }
}