using log4net;
using Overseer.Machines;
using Overseer.Models;
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Timer = System.Timers.Timer;

namespace Overseer
{
	public class MonitoringService : IDisposable, IMonitoringService
	{
		static readonly ILog Log = LogManager.GetLogger(typeof(MonitoringService));

		public event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

		Timer _timer;
		readonly IMachineManager _machineManager;
		readonly IConfigurationManager _configurationManager;
		readonly MachineProviderManager _providerManager;

		readonly ConcurrentDictionary<int, CancellationTokenSource> _pendingUpdates = new ConcurrentDictionary<int, CancellationTokenSource>();

		public MonitoringService(IMachineManager machineManager, IConfigurationManager configurationManager, MachineProviderManager providerManager)
		{
			_machineManager = machineManager;
			_providerManager = providerManager;
			_configurationManager = configurationManager;

			_configurationManager.ApplicationSettingsUpdated += (sender, args) =>
			{
				if (_timer == null) return;

				_timer.Interval = args.Data.Interval;
			};
		}

		public bool Enabled => _timer != null ? _timer.Enabled : false;

		void AssertTimer()
		{
			if (_timer != null) return;

			var settings = _configurationManager.GetApplicationSettings();
			_timer = new Timer(settings.Interval);
			_timer.Elapsed += (sender, args) => PollProviders();
		}

		public void StartMonitoring()
		{
			AssertTimer();

			if (_timer.Enabled) return;

			_timer.Start();
			Log.Info("Monitoring initiated.");
		}

		public void StopMonitoring()
		{
			AssertTimer();

			if (!_timer.Enabled) return;

			_timer.Stop();
			CancelPendingUpdates();
			Log.Info("Monitoring suspended.");
		}
		
		public void PollProviders()
		{
			try
			{
				//cancel any pending update that hasn't completed, it's likely timing out
				CancelPendingUpdates();

				//poll all the providers
				foreach (var provider in _providerManager.GetProviders(_machineManager.GetMachines()))
				{
					var cancellation = new CancellationTokenSource();
					provider.GetStatus(cancellation.Token)
						.ContinueWith(RaiseStatusUpdate, cancellation.Token)
						.DoNotAwait();

					_pendingUpdates[provider.MachineId] = cancellation;
				}
			}
			catch (Exception ex)
			{
				Log.Error("Monitoring Error", ex);
			}
		}

		void RaiseStatusUpdate(Task<MachineStatus> completedTask)
		{
			StatusUpdate?.Invoke(this, new EventArgs<MachineStatus>(completedTask.Result));
		}

		void CancelPendingUpdates()
		{
			foreach (var pendingUpdate in _pendingUpdates)
			{
				pendingUpdate.Value.Cancel();
			}

			_pendingUpdates.Clear();
		}

		public void Dispose()
		{
			_timer?.Dispose();
		}
	}
}
