using log4net;
using Microsoft.AspNet.SignalR;
using Overseer.Core;
using System.Threading.Tasks;

namespace Overseer.Hubs
{
    public class StatusHub : Hub
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(StatusHub));

        static int _connections;
        readonly MonitoringService _monitoringService;

        public StatusHub(MonitoringService monitoringService)
        {
            _monitoringService = monitoringService; 
        }
        
        public async Task StartMonitoring()
        {
            if (++_connections == 1)
            {
                Log.Info("A client is connected initiating monitoring...");                
                await _monitoringService.StartMonitoring();
            }
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            if (--_connections <= 0)
            {
                Log.Info("No clients connected suspending monitoring...");

                _monitoringService.StopMonitoring();
                _connections = 0;
            }

            return base.OnDisconnected(stopCalled);
        }
    }
}