using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

using Overseer.Models;

namespace Overseer.Machines
{
    public class MachineProviderManager
    {
        static readonly ConcurrentDictionary<int, IMachineProvider> _providerCache = new ConcurrentDictionary<int, IMachineProvider>();

        static readonly Lazy<ConcurrentDictionary<Type, Type>> _machineToProviderTypeMap = new Lazy<ConcurrentDictionary<Type, Type>>(() =>
        {
            var mapping = typeof(IMachineProvider)
                .GetAssignableTypes()
                .ToDictionary(type =>
                {
                    return (from i in type.GetInterfaces()
                            from arg in i.GetGenericArguments()
                            where typeof(Machine).IsAssignableFrom(arg)
                            select arg).First();
                });

            return new ConcurrentDictionary<Type, Type>(mapping);
        });

        readonly Func<Machine, IMachineProvider> _providerFactory;

        public MachineProviderManager(Func<Machine, IMachineProvider> providerFactory)
        {
            _providerFactory = providerFactory;
        }

        public IEnumerable<IMachineProvider> GetProviders(IEnumerable<Machine> machines)
        {
            return machines
                .Where(machine => !machine.Disabled)
                .Select(GetProvider);
        }

        public IMachineProvider GetProvider(Machine machine)
        {
            return _providerCache.GetOrAdd(machine.Id, id => _providerFactory.Invoke(machine));
        }

        public static Type GetProviderType(Machine machine)
        {
            if (_machineToProviderTypeMap.Value.TryGetValue(machine.GetType(), out Type providerType)) return providerType;

            throw new InvalidOperationException("Unmapped Machine Type");
        }
    }
}
