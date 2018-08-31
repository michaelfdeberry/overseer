using log4net;
using Microsoft.AspNet.SignalR;
using Overseer.Core;
using Overseer.Core.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Overseer.Hubs
{
    public class StatusHub : Hub
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(StatusHub)); 
        static readonly HashSet<string> MonitoringGroup = new HashSet<string>();
        public static readonly string MonitoringGroupName = "MonitoringGroup";

        readonly MonitoringService _monitoringService;

        public StatusHub(MonitoringService monitoringService)
        {
            _monitoringService = monitoringService;
        }
        
        public async Task<bool> StartMonitoring()
        {
            MonitoringGroup.Add(Context.ConnectionId);
            await Groups.Add(Context.ConnectionId, "MonitoringGroup");
                
            if (MonitoringGroup.Count == 1)
            {
                Log.Info("A client connected, initiating monitoring...");                
                _monitoringService.StartMonitoring();
            }

            return true;
        }

        public override async Task OnDisconnected(bool stopCalled)
        {
            MonitoringGroup.Remove(Context.ConnectionId); 
            if (!MonitoringGroup.Any())
            {
                Log.Info("All clients disconnected, suspending monitoring...");
                _monitoringService.StopMonitoring();
            }
            
            await base.OnDisconnected(stopCalled);
        }

        public static void PushStatusUpdate(PrinterStatus statusUpdate)
        {
            GlobalHost.ConnectionManager.GetHubContext<StatusHub>()
                .Clients
                .Group(MonitoringGroupName)
                .StatusUpdate(statusUpdate);
        }
    }
}