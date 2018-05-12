using System.Collections.Generic;
using System.Linq;
using log4net;
using Microsoft.AspNet.SignalR;
using Overseer.Core;
using System.Threading.Tasks;
using Overseer.Core.Models;

namespace Overseer.Hubs
{
    public class StatusHub : Hub
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(StatusHub)); 
        static readonly HashSet<string> MonitoringGroup = new HashSet<string>();
        public static readonly string MonitoringGroupName = "MonitoringGroup";

        readonly MonitoringService _monitoringService;
        readonly ConfigurationManager _configurationManager;

        public StatusHub(MonitoringService monitoringService, ConfigurationManager configurationManager)
        {
            _monitoringService = monitoringService;
            _configurationManager = configurationManager;
        }
        
        public async Task<bool> StartMonitoring(string token)
        { 
            if (!_configurationManager.AuthenticateToken(token)) return false;

            MonitoringGroup.Add(Context.ConnectionId);
            await Groups.Add(Context.ConnectionId, "MonitoringGroup");
                
            if (MonitoringGroup.Count == 1)
            {
                Log.Info("A client connected, initiating monitoring...");                
                await _monitoringService.StartMonitoring();
            }

            return true;
        }

        public override async Task OnDisconnected(bool stopCalled)
        {
            MonitoringGroup.Remove(Context.ConnectionId);
            await Groups.Remove(Context.ConnectionId, "StatusGroup");

            if (!MonitoringGroup.Any())
            {
                Log.Info("All clients disconnected, suspending monitoring...");
                _monitoringService.StopMonitoring();
            }

            await base.OnDisconnected(stopCalled);
        }

        public static void PushStatusUpdate(Dictionary<int, PrinterStatus> statusUpdate)
        {
            GlobalHost.ConnectionManager.GetHubContext<StatusHub>()
                .Clients
                .Group(MonitoringGroupName)
                .StatusUpdate(statusUpdate);
        }
    }
}