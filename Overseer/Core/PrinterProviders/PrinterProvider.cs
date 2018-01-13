using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Overseer.Core.Models;

namespace Overseer.Core.PrinterProviders
{
    public abstract class PrinterProvider : IPrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(RepRapProvider));

        //if there are 5 consecutive errors 
        const int MaxExceptionCount = 5;
        //reduce the update interval to every 2 minutes
        const int ExceptionTimeout = 2;

        readonly Stopwatch _stopwatch = new Stopwatch();

        int _exceptionCount;

        public abstract int PrinterId { get; }

        public abstract Task SetToolTemperature(string toolName, int targetTemperature);

        public abstract Task SetBedTemperature(int targetTemperature);

        public abstract Task SetFlowRate(string toolName, int percentage);

        public abstract Task SetFeedRate(int percentage);

        public abstract Task SetFanSpeed(int percentage);

        public abstract Task PausePrint();

        public abstract Task ResumePrint();

        public abstract Task CancelPrint();

        public abstract Task LoadConfiguration(Printer printer);

        protected abstract Task<PrinterStatus> GetPrinterStatusImpl(CancellationToken cancellationToken);

        public async Task<PrinterStatus> GetPrinterStatus(CancellationToken cancellationToken)
        {
            //if the stopwatch is running and it's in the timeout period just return an offline status
            if (_stopwatch.IsRunning && _stopwatch.Elapsed.TotalMinutes < ExceptionTimeout)
            {
                return new PrinterStatus { PrinterId = PrinterId };
            }

            try
            {
                //if the stopwatch isn't running or if the timeout period is exceeded try to get the status
                var status = await GetPrinterStatusImpl(cancellationToken);

                //if the status was retrieve successfully reset the exception count and stop the stopwatch
                _exceptionCount = 0;
                _stopwatch.Stop();

                return status;
            }
            catch (Exception ex)
            {
                Log.Info("Status Update Failure", ex);

                _exceptionCount++;
                if (_exceptionCount >= MaxExceptionCount)
                {
                    //start the timer, or restart the timer in the case it was already running
                    //this will keep the printer in an offline state and recheck again after the timeout period
                    _stopwatch.Restart();
                }

                return new PrinterStatus { PrinterId = PrinterId };
            }
        }
    }
}
