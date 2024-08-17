using log4net;
using Microsoft.AspNetCore.SignalR;
using Overseer.Models;

namespace Overseer.Server.Hubs
{
    public class StatusHub : Hub
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(StatusHub));

        public const string MonitoringGroupName = "MonitoringGroup";
        readonly IMonitoringService _monitoringService;
        readonly HashSet<string> _monitoringGroup = new HashSet<string>();

        public StatusHub(IMonitoringService monitoringService, IHubContext<StatusHub> hubContext)
        {
            _monitoringService = monitoringService;

            _monitoringService.StatusUpdate += (object? sender, EventArgs<MachineStatus> e)  =>
            {
                hubContext
                    .Clients
                    .Group(MonitoringGroupName)
                    .SendAsync("StatusUpdate", e.Data);
            };
        }
         
        public async Task StartMonitoring()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, MonitoringGroupName);
            _monitoringGroup.Add(Context.ConnectionId);
             
            // if this is the first connection the monitoring isn't running, start it...
            if (_monitoringGroup.Count == 1)
            { 
                Log.Info("A client connected, initiating monitoring...");
                _monitoringService.StartMonitoring();
                _monitoringService.PollProviders();
            } 
        }

        public void PollProviders()
        {
            // only poll on the request of a connection that is already connected. 
            if (!_monitoringGroup.Contains(Context.ConnectionId)) return;
            _monitoringService.PollProviders();
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
