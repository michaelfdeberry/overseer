using System;
using System.Linq;

using log4net;

using Overseer.Machines;
using Overseer.Models;

namespace Overseer
{
    public sealed class MonitoringService : IDisposable, IMonitoringService
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(MonitoringService));

        public event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

        readonly IMachineManager _machineManager;
        readonly IConfigurationManager _configurationManager;
        readonly MachineProviderManager _providerManager;

        public MonitoringService(IMachineManager machineManager, IConfigurationManager configurationManager, MachineProviderManager providerManager)
        {
            _machineManager = machineManager;
            _providerManager = providerManager;
            _configurationManager = configurationManager;

            _configurationManager.ApplicationSettingsUpdated += (sender, args) =>
            {
                var providers = _providerManager.GetProviders(_machineManager.GetMachines());
                providers.ToList().ForEach(provider => provider.Start(args.Data.Interval));
            };
        }

        public void StartMonitoring()
        {
            Log.Info("Starting monitoring service");
            var interval = _configurationManager.GetApplicationSettings().Interval;
            var providers = _providerManager.GetProviders(_machineManager.GetMachines());
            foreach (var provider in providers)
            {
                provider.Start(interval);
                provider.StatusUpdate += OnStatusUpdate;
            }
        }

        public void StopMonitoring()
        {
            Log.Info("Stopping monitoring service");
            var providers = _providerManager.GetProviders(_machineManager.GetMachines());
            foreach (var provider in providers)
            {
                provider.Stop();
                provider.StatusUpdate -= OnStatusUpdate;
            }
        }

        public void Dispose()
        {
            Log.Info("Disposing monitoring service");
            StopMonitoring();
        }

        private void OnStatusUpdate(object sender, EventArgs<MachineStatus> e)
        {
            StatusUpdate?.Invoke(sender, e);
        }
    }
}
