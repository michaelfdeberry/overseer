using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Microsoft.AspNet.SignalR;
using Overseer.Core.Models;
using Overseer.Hubs;
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
        public event EventHandler<StatusUpdateEventArgs> StatusUpdate;
        
        static readonly ILog Log = LogManager.GetLogger(typeof(MonitoringService));
        
        readonly Timer _timer;
        public bool IsMonitoring => _timer != null;

        public MonitoringService(int interval)
        {
            _timer = new Timer(interval);
            _timer.Elapsed += async (sender, args) => await GetStatuses();
        }

        public async Task StartMonitoring()
        {
            if (_timer.Enabled) return;

            _timer.Start();
            Log.Info("Monitoring initiated.");
            
            //prime the statuses so that there is information available immediately 
            await GetStatuses();
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

        async Task GetStatuses()
        {
            try
            {
                var cancellation = new CancellationTokenSource();
                cancellation.CancelAfter((int)_timer.Interval);

                var tasks = PrinterProviderManager.ProviderCache.Values.Select(provider => provider.GetPrinterStatus(cancellation.Token));
                await Task.WhenAll(tasks).ContinueWith(task =>
                {
                    var status = task.Result.OrderByDescending(x => x.State).ToDictionary(x => x.PrinterId);
                    if (!status.Any()) return;

                    StatusUpdate?.Invoke(this, new StatusUpdateEventArgs(status));
                    StatusHub.PushStatusUpdate(status);
                }, cancellation.Token);
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