using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using log4net;
using Overseer.Core.Models;
using Overseer.Core.PrinterProviders;

namespace Overseer.Core
{
    public class PrinterProviderManager
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(PrinterProviderManager));
        public static readonly ConcurrentDictionary<int, IPrinterProvider> ProviderCache = new ConcurrentDictionary<int, IPrinterProvider>();
        
        public IReadOnlyList<IPrinterProvider> GetPrinterProviders()
        {
            return ProviderCache.Values.ToList();
        }

        public void LoadCache(IEnumerable<Printer> printers)
        {
            printers.Where(x => !x.Disabled).ForEach(printer => GetProvider(printer));
        }

        public IPrinterProvider GetProvider(Printer printer)
        {
            if (!ProviderCache.TryGetValue(printer.Id, out IPrinterProvider provider))
            {
                var providerType = Type.GetType($"Overseer.Core.PrinterProviders.{printer.PrinterType}Provider");
                if (providerType == null)
                    throw new ArgumentOutOfRangeException(nameof(printer.PrinterType), "Unsupported Printer Type");

                provider = (IPrinterProvider)Activator.CreateInstance(providerType, printer);
                Log.Debug($"Created {printer.PrinterType} Provider for printer {printer.Id}");
            }

            //only add the provider to the cache if it's enabled
            if (!printer.Disabled)
            {                
                ProviderCache[printer.Id] = provider;
            }

            return provider;
        }

        public void RemoveProvider(int printerId)
        {
            if (!ProviderCache.ContainsKey(printerId)) return;

            IPrinterProvider provider;
            var removeAttempts = 1;
            while (!ProviderCache.TryRemove(printerId, out provider))
            {
                if (removeAttempts++ > 10)
                {
                    Log.Error("Failed to remove printer provider");
                    return;
                }
            }

            Log.Debug($"{provider.GetType().Name} for printer {printerId} removed after {removeAttempts} attempts");
        }
    }
}
