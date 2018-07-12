using log4net;
using System.Threading.Tasks;

namespace Overseer.Core
{
    public class ControlManager
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(ControlManager));
        
        readonly PrinterProviderManager _printerProviderManager; 

        public ControlManager(PrinterProviderManager printerProviderManager)
        {
            _printerProviderManager = printerProviderManager;
        }

        public Task Pause(int printerId)
        {
            Log.Info($"Pausing Printer for Printer {printerId}");

            return _printerProviderManager.GetProvider(printerId).PausePrint();
        }

        public Task Resume(int printerId)
        {
            Log.Info($"Resuming Print for Printer {printerId}");

            return _printerProviderManager.GetProvider(printerId).ResumePrint();
        }

        public Task Cancel(int printerId)
        {
            Log.Info($"Canceling Print for Printer {printerId}");

            return _printerProviderManager.GetProvider(printerId).CancelPrint();
        }

        public Task SetTemperature(int printerId, string tool, int temperature)
        {
            Log.Info($"Settings {tool} Temp. for Printer {printerId} to {temperature}");

            var provider = _printerProviderManager.GetProvider(printerId);
            return tool.ToLower() == "bed"
                ? provider.SetBedTemperature(temperature)
                : provider.SetToolTemperature(tool, temperature);
        }

        public Task SetFeedRate(int printerId, int feedRate)
        {
            Log.Info($"Setting Printer {printerId} Feed Rate to {feedRate}%");

            return _printerProviderManager.GetProvider(printerId).SetFeedRate(feedRate);
        }

        public Task SetFlowRate(int printerId, string tool, int flowRate)
        {
            Log.Info($"Settings Printer {printerId} Flow Rate for {tool} to {flowRate}%");
            return _printerProviderManager.GetProvider(printerId).SetFlowRate(tool, flowRate);
        }

        public Task SetFanSpeed(int printerId, int percentage)
        {
            Log.Info($"Setting Printer {printerId} Fan Speed to {percentage}");

            return _printerProviderManager.GetProvider(printerId).SetFanSpeed(percentage);
        }
    }
}