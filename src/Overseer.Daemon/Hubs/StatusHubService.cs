using log4net;
using System.Collections.Generic;
using System.Linq;

namespace Overseer.Daemon.Hubs
{
    public class StatusHubService
    {
        public const string MonitoringGroupName = "MonitoringGroup";
        static readonly ILog Log = LogManager.GetLogger(typeof(StatusHubService));

        readonly HashSet<string> MonitoringGroup = new HashSet<string>();        
        readonly IMonitoringService _monitoringService;

        public StatusHubService(IMonitoringService monitoringService)
        {
            _monitoringService = monitoringService;
        }

        public void StartMonitoring(string connectionId)
        {
            MonitoringGroup.Add(connectionId);

            if (MonitoringGroup.Count == 1)
            {
                Log.Info("A client connected, initiating monitoring...");
                _monitoringService.StartMonitoring();
                _monitoringService.PollProviders();
            }
        }

        public void PollProviders(string connectionId)
        {
            if (MonitoringGroup.Contains(connectionId)) return;

            _monitoringService.PollProviders();
        }

        public void StopMonitoring(string connectionId)
        {
            MonitoringGroup.Remove(connectionId);
            if (!MonitoringGroup.Any())
            {
                Log.Info("All clients disconnected, suspending monitoring...");
                _monitoringService.StopMonitoring();
            }
        }
    }
}
