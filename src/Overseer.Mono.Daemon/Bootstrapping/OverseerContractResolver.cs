using Newtonsoft.Json.Serialization;
using System;

namespace Overseer.Daemon.Bootstrapping
{
    public class OverseerContractResolver : IContractResolver
    {
        readonly IContractResolver _defaultContractSerializer;

        public OverseerContractResolver()
        {
            _defaultContractSerializer = new DefaultContractResolver();            
        }

        public JsonContract ResolveContract(Type type)
        {
            return _defaultContractSerializer.ResolveContract(type);
        }
    }
}
