using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using log4net;
using Overseer.Core.Data;
using Overseer.Core.Models;
using Overseer.Core.PrinterProviders;

namespace Overseer.Core
{
    public class PrinterProviderManager
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(PrinterProviderManager));
        static readonly ConcurrentDictionary<int, IPrinterProvider> ProviderCache = new ConcurrentDictionary<int, IPrinterProvider>();
        
        public static IReadOnlyList<IPrinterProvider> GetPrinterProviders()
        {
            return ProviderCache.Values.ToList();
        }

        readonly IRepository<Printer> _printers;

        public PrinterProviderManager(IDataContext context)
        {
            _printers = context.GetRepository<Printer>();
        }

        public void LoadCache(IEnumerable<Printer> printers)
        {
            printers.Where(x => !x.Disabled).ForEach(printer => GetProvider(printer));
        }

        IPrinterProvider CreateProvider(Printer printer)
        {
            var providerType = Type.GetType($"Overseer.Core.PrinterProviders.{printer.PrinterType}Provider");
            if (providerType == null)
                throw new ArgumentOutOfRangeException(nameof(printer.PrinterType), "Unsupported Printer Type");

            var provider = (IPrinterProvider)Activator.CreateInstance(providerType, printer);
            Log.Debug($"Created {printer.PrinterType} Provider for printer {printer.Id}");

            return provider;
        }

        public IPrinterProvider GetProvider(int printerId)
        {
            return GetProvider(_printers.GetById(printerId));
        }

        public IPrinterProvider GetProvider(Printer printer)
        {
            if (printer.Id == 0) return CreateProvider(printer);

            if (!ProviderCache.TryGetValue(printer.Id, out IPrinterProvider provider))
            {
                provider = CreateProvider(printer);
                if (!printer.Disabled)
                {
                    CacheProvider(printer.Id, provider);
                }
            }
            
            return provider;
        }

        public void CacheProvider(int printerId)
        {
            CacheProvider(printerId, GetProvider(printerId));
        }

        public void CacheProvider(int printerId, IPrinterProvider provider)
        {
            ProviderCache[printerId] = provider;
        }

        public void RemoveProvider(int printerId)
        {
            if (!ProviderCache.ContainsKey(printerId)) return;

            IPrinterProvider provider;
            var removeAttempts = 1;
            while (!ProviderCache.TryRemove(printerId, out provider))
            {
                if (removeAttempts++ > 3)
                {
                    Log.Error("Failed to remove printer provider");
                    return;
                }
            }

            Log.Debug($"{provider.GetType().Name} for printer {printerId} removed after {removeAttempts} attempts");
        }

        public Task LoadConfiguration(Printer printer)
        {
            var provider = GetProvider(printer);
            return provider.LoadConfiguration(printer);
        }
    }
}
