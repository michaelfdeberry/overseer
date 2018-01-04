using System.Collections.Generic;
using Nancy.Bootstrapper;
using Newtonsoft.Json;

namespace Overseer.Startup
{
    /// <summary>
    /// Setup the dependencies for Nancy
    /// </summary>
    public class OverseerRegistrations : IRegistrations
    {
        public OverseerRegistrations()
        {
            InstanceRegistrations = new List<InstanceRegistration>();

            CollectionTypeRegistrations = new List<CollectionTypeRegistration>();

            TypeRegistrations = new[]
            {
                new TypeRegistration(typeof(JsonSerializer), typeof(OverseerJsonSerializer))
            };
        }

        public IEnumerable<TypeRegistration> TypeRegistrations { get; }

        public IEnumerable<CollectionTypeRegistration> CollectionTypeRegistrations { get; }

        public IEnumerable<InstanceRegistration> InstanceRegistrations { get; }
    }
}