using Microsoft.AspNetCore.SignalR;
using Overseer.Models;
using System;
using System.Threading.Tasks;

namespace Overseer.Daemon.Hubs
{
    public class StatusHub : Hub
    {
        readonly StatusHubService _statusHubService;

        public StatusHub(StatusHubService statusHubService)
        {
            _statusHubService = statusHubService;
        }

        public async Task StartMonitoring()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, StatusHubService.MonitoringGroupName);
            _statusHubService.StartMonitoring(Context.ConnectionId);
        }

        public void PollProviders()
        {
            _statusHubService.PollProviders(Context.ConnectionId);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _statusHubService.StopMonitoring(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public static void PushStatusUpdate(IHubContext<StatusHub> hubContext, MachineStatus status)
        {
            hubContext
                .Clients
                .Group(StatusHubService.MonitoringGroupName)
                .SendAsync("StatusUpdate", status);
        }
    }
}
