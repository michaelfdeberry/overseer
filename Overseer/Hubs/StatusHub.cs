using System;
using System.Threading.Tasks;
using log4net;
using Microsoft.AspNet.SignalR;
using Overseer.Core;

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
        
        /// <summary>
        ///     This is require else the on connected/disconnected methods won't be invoked.
        /// </summary>
        public async Task StartMonitoring()
        {
            if (++_connections == 1)
            {
                Log.Info("A client is connected starting monitoring...");                
                await _monitoringService.StartMonitoring();
            }
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            if (--_connections <= 0)
            {
                Log.Info("No clients connected stopping monitoring...");

                _monitoringService.StopMonitoring();
                _connections = 0;
            }

            return base.OnDisconnected(stopCalled);
        }
    }
}