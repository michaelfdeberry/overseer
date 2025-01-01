using log4net;

using Microsoft.AspNetCore.SignalR;

namespace Overseer.Server.Hubs
{
    public class StatusHub(IMonitoringService monitoringService) : Hub
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(StatusHub));

        public const string MonitoringGroupName = "MonitoringGroup";
        readonly IMonitoringService _monitoringService = monitoringService;
        readonly HashSet<string> _monitoringGroup = [];

        public async Task StartMonitoring()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, MonitoringGroupName);
            _monitoringGroup.Add(Context.ConnectionId);

            // if this is the first connection the monitoring isn't running, start it...
            if (_monitoringGroup.Count == 1)
            {
                Log.Info("A client connected, initiating monitoring...");
                _monitoringService.StartMonitoring();
            }
        }

        public async override Task OnDisconnectedAsync(Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, MonitoringGroupName);
            _monitoringGroup.Remove(Context.ConnectionId);

            // all clients disconnected, stop monitoring
            if (_monitoringGroup.Count == 0)
            {
                _monitoringService.StopMonitoring();
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
