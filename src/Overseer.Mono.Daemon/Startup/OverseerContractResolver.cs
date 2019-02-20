using Microsoft.AspNet.SignalR.Infrastructure;
using Newtonsoft.Json.Serialization;
using System;
using System.Reflection;

namespace Overseer.Daemon.Startup
{
    public class OverseerContractResolver : IContractResolver
    {
        readonly Assembly _assembly;
        readonly IContractResolver _camelCaseContractResolver;
        readonly IContractResolver _defaultContractSerializer;

        public OverseerContractResolver()
        {
            _defaultContractSerializer = new DefaultContractResolver();
            _camelCaseContractResolver = new CamelCasePropertyNamesContractResolver();
            _assembly = typeof(Connection).Assembly;
        }

        public JsonContract ResolveContract(Type type)
        {
            return type.Assembly.Equals(_assembly)
                ? _defaultContractSerializer.ResolveContract(type)
                : _camelCaseContractResolver.ResolveContract(type);
        }
    }
}
