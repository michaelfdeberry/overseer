using Overseer.Core.Data;
using Overseer.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Overseer.Core
{
    public class PrinterManager
    {
        readonly IRepository<Printer> _printers;
        readonly PrinterProviderManager _printerProviderManager;

        public PrinterManager(IDataContext context, PrinterProviderManager printerProviderManager)
        {
            _printers = context.GetRepository<Printer>();
            _printerProviderManager = printerProviderManager;
        }

        public Printer GetPrinter(int id)
        {
            return _printers.GetById(id);
        }

        public IReadOnlyList<Printer> GetPrinters()
        {
            var printers = _printers.GetAll();
            _printerProviderManager.LoadCache(printers);

            return printers;
        }

        public async Task<Printer> CreatePrinter(Printer printer)
        {
            //load any default configuration that will be retrieved from the printer.
            await _printerProviderManager.LoadConfiguration(printer);

            //if the configuration is updated with data from the printer then store the configuration.
            _printers.Create(printer);

            //cache a provider since the connection is verified.
            _printerProviderManager.CacheProvider(printer.Id);

            return printer;
        }

        public async Task<Printer> UpdatePrinter(Printer printer)
        {
            if (printer.Disabled)
            {
                //if the printer is disabled remove the provider to stop monitoring
                _printerProviderManager.RemoveProvider(printer.Id);
            }
            else
            {
                //update the configuration from the printer on config printer change
                await _printerProviderManager.LoadConfiguration(printer);
            }

            _printers.Update(printer);
            return printer;
        }

        public void DeletePrinter(int printerId)
        {
            _printerProviderManager.RemoveProvider(printerId);
            _printers.Delete(printerId);
        }
    }
}
