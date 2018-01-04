using System.Threading;
using System.Threading.Tasks;
using Overseer.Core.Models;

namespace Overseer.Core.PrinterProviders
{
    public interface IPrinterProvider
    {
        int PrinterId { get; }

        Task SetToolTemperature(string toolName, int targetTemperature);

        Task SetBedTemperature(int targetTemperature);

        Task SetFlowRate(string toolName, int percentage);

        Task SetFeedRate(int percentage);

        Task SetFanSpeed(int percentage);

        Task PausePrint();

        Task ResumePrint();

        Task CancelPrint();

        Task LoadConfiguration(Printer printer);

        Task<PrinterStatus> GetPrinterStatus(CancellationToken cancellationToken);
    }
}