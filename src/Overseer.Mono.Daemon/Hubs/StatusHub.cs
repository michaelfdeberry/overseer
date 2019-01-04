using log4net;
using Microsoft.AspNet.SignalR;
using Overseer.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Overseer.Daemon.Hubs
{
    public class StatusHub : Hub
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(StatusHub)); 
        static readonly HashSet<string> MonitoringGroup = new HashSet<string>();
        public static readonly string MonitoringGroupName = "MonitoringGroup";

        readonly IMonitoringService _monitoringService;

        public StatusHub(IMonitoringService monitoringService)
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
				_monitoringService.PollProviders();
            }

            return true;
        }

		public void PollProviders()
		{
			_monitoringService.PollProviders();
		}

        public override Task OnDisconnected(bool stopCalled)
        {
            MonitoringGroup.Remove(Context.ConnectionId); 
            if (!MonitoringGroup.Any())
            {
                Log.Info("All clients disconnected, suspending monitoring...");
                _monitoringService.StopMonitoring();
            }
            
            return base.OnDisconnected(stopCalled);
        }

        public static void PushStatusUpdate(MachineStatus statusUpdate)
        {
            GlobalHost.ConnectionManager.GetHubContext<StatusHub>()
                .Clients
                .Group(MonitoringGroupName)
                .StatusUpdate(statusUpdate);
        }
    }
}