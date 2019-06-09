using Microsoft.AspNet.SignalR;
using Overseer.Models;
using System.Threading.Tasks;

namespace Overseer.Daemon.Hubs
{
    #pragma warning disable UseAsyncSuffix 
    public class StatusHub : Hub
    {
        readonly StatusHubService _statusHubService;

        public StatusHub(StatusHubService statusHubService)
        {
            _statusHubService = statusHubService;
        }
        
        public async Task StartMonitoring()
        {
            await Groups.Add(Context.ConnectionId, "MonitoringGroup");
            _statusHubService.StartMonitoring(Context.ConnectionId);
        }

        public void PollProviders()
        {
            _statusHubService.PollProviders(Context.ConnectionId);
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            _statusHubService.StopMonitoring(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        public static void PushStatusUpdate(MachineStatus statusUpdate)
        {
            GlobalHost.ConnectionManager.GetHubContext<StatusHub>()
                .Clients
                .Group(StatusHubService.MonitoringGroupName)
                .StatusUpdate(statusUpdate);
        }
    }
}