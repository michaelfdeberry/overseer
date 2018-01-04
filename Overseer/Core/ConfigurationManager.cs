using System.Collections.Generic;
using System.Threading.Tasks; 
using Overseer.Core.Data;
using Overseer.Core.Models;

namespace Overseer.Core
{
    public class ConfigurationManager
    {
        readonly IDataContext _context;
        readonly IRepository<Printer> _printers;        
        readonly PrinterProviderManager _printerProviderManager;
        readonly MonitoringService _monitoringService; 

        public ConfigurationManager(IDataContext context, PrinterProviderManager printerProviderManager,
            MonitoringService monitoringService)
        {
            _context = context;
            _printers = context.GetRepository<Printer>(); 
            _printerProviderManager = printerProviderManager;
            _monitoringService = monitoringService;
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
            //create the printer to get the id
            _printers.Create(printer);

            //this will create and cache a provider that will be used to interact with this printer
            var provider = _printerProviderManager.GetProvider(printer);

            //load any default configuration that will be retrieved from the printer.
            await provider.LoadConfiguration(printer);

            //update the printer configuration
            _printers.Update(printer);

            return printer;
        }

        public async Task<Printer> UpdatePrinter(Printer printer)
        {
            _printers.Update(printer);

            if (printer.Disabled)
            {
                //if the printer is disabled remove the provider to stop monitoring
                _printerProviderManager.RemoveProvider(printer.Id);
            }
            else
            {
                //update the configuration from the printer on config printer change
                var provider = _printerProviderManager.GetProvider(printer);
                await provider.LoadConfiguration(printer);
            }

            return printer;
        }

        public void DeletePrinter(int printerId)
        {
            _printerProviderManager.RemoveProvider(printerId);
            var printer = _printers.GetById(printerId);
            _printers.Delete(printer);
        }

        public ApplicationSettings GetApplicationSettings()
        {
            return _context.GetApplicationSettings();
        }

        public async Task<ApplicationSettings> UpdateApplicationSettings(ApplicationSettings settings)
        {
            _context.UpdateApplicationSettings(settings);
            _monitoringService.Update(settings);

            return settings;
        }
    }
}