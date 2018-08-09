using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Overseer.Core.Models;
using Overseer.Core.PrinterProviders;
using Timer = System.Timers.Timer;

namespace Overseer.Core
{
    public class StatusUpdateEventArgs : EventArgs
    {
        public Dictionary<int, PrinterStatus> Status { get; }

        public StatusUpdateEventArgs(Dictionary<int, PrinterStatus> status)
        {
            Status = status;
        }
    }

    public class MonitoringService : IDisposable
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(MonitoringService));

        public event EventHandler<StatusUpdateEventArgs> StatusUpdate;
        
        readonly Timer _timer;

        readonly Func<IEnumerable<IPrinterProvider>> _printerProvidersAccessor;

        readonly ConcurrentDictionary<int, (Task pendingTask, CancellationTokenSource cancellation)> _pendingUpdates =
            new ConcurrentDictionary<int, (Task pendingTask, CancellationTokenSource cancellation)>();
        
        public MonitoringService(int interval, Func<IEnumerable<IPrinterProvider>> printerProvidersAccessor)
        {
            _timer = new Timer(interval);
            _timer.Elapsed += (sender, args) => GetStatuses();

            _printerProvidersAccessor = printerProvidersAccessor;
        }

        public void StartMonitoring()
        {
            if (_timer.Enabled) return;

            _timer.Start();
            Log.Info("Monitoring initiated.");
            
            //prime the statuses so that there is information available immediately 
            GetStatuses();
        }

        public void StopMonitoring()
        {
            if (!_timer.Enabled) return;

            _timer.Stop();
            Log.Info("Monitoring suspended.");
        }

        public void Update(ApplicationSettings settings)
        {
            _timer.Interval = settings.Interval;
        }
        
        void GetStatuses()
        {
            try
            {
                void OnStatusUpdateComplete(Task<PrinterStatus> completedTask)
                {
                    if (completedTask.Result == null) return;

                    StatusUpdate?.Invoke(this, new StatusUpdateEventArgs(new Dictionary<int, PrinterStatus>
                    {
                        { completedTask.Result.PrinterId, completedTask.Result }
                    }));
                }

                foreach (var provider in _printerProvidersAccessor())
                {
                    //remove and cancel any pending update that hasn't completed, it's likely timing out
                    if (_pendingUpdates.ContainsKey(provider.PrinterId) &&
                        _pendingUpdates.TryRemove(provider.PrinterId, out var pendingUpdate))
                    {
                        pendingUpdate.cancellation.Cancel();
                    }

                    //create the new pending status update that will push the results when it completes.
                    var cancellation = new CancellationTokenSource();
                    var updateTask = provider.GetPrinterStatus(cancellation.Token)
                        .ContinueWith(OnStatusUpdateComplete, cancellation.Token);

                    _pendingUpdates[provider.PrinterId] = (updateTask, cancellation);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Monitoring Error", ex);
            }
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}