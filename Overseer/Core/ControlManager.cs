using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using log4net;
using Overseer.Core.Data;
using Overseer.Core.Models;
using Overseer.Core.PrinterProviders;

namespace Overseer.Core
{
    public class ControlManager
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(ControlManager));

        readonly IRepository<Printer> _printers;
        readonly PrinterProviderManager _printerProviderManager;
        readonly MethodInfo[] _methods;

        public ControlManager(IDataContext context, PrinterProviderManager printerProviderManager)
        {
            _printers = context.GetRepository<Printer>();
            _printerProviderManager = printerProviderManager;
            _methods = GetType().GetMethods(BindingFlags.Public | BindingFlags.Instance);
        }

        public Task Pause(int printerId)
        {
            Log.Info($"Pausing Printer for Printer {printerId}");

            return GetProvider(printerId).PausePrint();
        }

        public Task Resume(int printerId)
        {
            Log.Info($"Resuming Print for Printer {printerId}");

            return GetProvider(printerId).ResumePrint();
        }

        public Task Cancel(int printerId)
        {
            Log.Info($"Canceling Print for Printer {printerId}");

            return GetProvider(printerId).CancelPrint();
        }

        public Task SetTemperature(int printerId, string tool, int temperature)
        {
            Log.Info($"Settings {tool} Temp. for Printer {printerId} to {temperature}");

            var provider = GetProvider(printerId);
            return tool.ToLower() == "bed"
                ? provider.SetBedTemperature(temperature)
                : provider.SetToolTemperature(tool, temperature);
        }

        public Task SetFeedRate(int printerId, int feedRate)
        {
            Log.Info($"Setting Printer {printerId} Feed Rate to {feedRate}%");

            return GetProvider(printerId).SetFeedRate(feedRate);
        }

        public Task SetFlowRate(int printerId, string tool, int flowRate)
        {
            Log.Info($"Settings Printer {printerId} Flow Rate for {tool} to {flowRate}%");
            return GetProvider(printerId).SetFlowRate(tool, flowRate);
        }

        public Task SetFanSpeed(int printerId, int percentage)
        {
            Log.Info($"Setting Printer {printerId} Fan Speed to {percentage}");

            return GetProvider(printerId).SetFanSpeed(percentage);
        }
        
        IPrinterProvider GetProvider(int printerId)
        {
            var printer = _printers.GetById(printerId);
            return _printerProviderManager.GetProvider(printer);
        }
    }
}