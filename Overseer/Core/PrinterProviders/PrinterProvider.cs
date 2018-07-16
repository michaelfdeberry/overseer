using log4net;
using Overseer.Core.Models;
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Overseer.Core.PrinterProviders
{
    public abstract class PrinterProvider : IPrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(PrinterProvider));

        //if there are 5 consecutive errors 
        const int MaxExceptionCount = 5;

        //reduce the update interval to every 2 minutes
        const int ExceptionTimeout = 2;

        readonly Stopwatch _stopwatch = new Stopwatch();

        int _exceptionCount;

        public abstract int PrinterId { get; }

        public virtual Task SetToolTemperature(string toolName, int targetTemperature)
        {
            return ExecuteGcode($"M104 P{GetToolIndex(toolName)} S{targetTemperature}");
        }

        public virtual Task SetBedTemperature(int targetTemperature)
        {
            return ExecuteGcode($"M140 S{targetTemperature}");
        }

        public virtual Task SetFlowRate(string toolName, int percentage)
        {
            return ExecuteGcode($"M221 D{GetToolIndex(toolName)} S{percentage}");
        }

        public virtual Task SetFeedRate(int percentage)
        {
            return ExecuteGcode($"M220 S{percentage}");
        }

        public virtual Task SetFanSpeed(int percentage)
        {
            var speed = (int)(255 * (percentage / 100f));
            return ExecuteGcode($"M106 S{speed}");
        }

        public virtual Task PausePrint()
        {
            return ExecuteGcode("M25");
        }

        public virtual Task ResumePrint()
        {
            return ExecuteGcode("M24");
        }

        public virtual Task CancelPrint()
        {
            return ExecuteGcode("M0");
        }
        
        public abstract Task LoadConfiguration(Printer printer);

        protected abstract Task ExecuteGcode(string command);

        protected abstract Task<PrinterStatus> AcquireStatus(CancellationToken cancellationToken);
        
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
                var status = await AcquireStatus(cancellationToken);

                //if the status was retrieve successfully reset the exception count and stop the stopwatch
                _exceptionCount = 0;
                _stopwatch.Stop();

                return status;
            }
            catch (Exception ex)
            {
                Log.Debug("Status Update Failure", ex);

                _exceptionCount++;
                if (_exceptionCount >= MaxExceptionCount)
                {
                    //start the timer, or restart the timer in the case it was already running
                    //this will keep the printer in an offline state and recheck again after the timeout period
                    _stopwatch.Restart();
                    Log.Debug("Max consecutive exception count reached, throttling updates");
                }

                return new PrinterStatus { PrinterId = PrinterId };
            }
        }

        static string GetToolIndex(string toolName)
        {
            return string.Join(string.Empty, toolName.Where(char.IsDigit));
        }
    }
}
