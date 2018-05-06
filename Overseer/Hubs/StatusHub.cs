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
        readonly ConfigurationManager _configurationManager;

        public StatusHub(MonitoringService monitoringService, ConfigurationManager configurationManager)
        {
            _monitoringService = monitoringService;
            _configurationManager = configurationManager;
        }
        
        public async Task<bool> StartMonitoring(string token)
        { 
            if (!_configurationManager.AuthenticateToken(token)) return false;

            if (++_connections == 1)
            {
                Log.Info("A client connected, initiating monitoring...");                
                await _monitoringService.StartMonitoring();
            }

            return true;
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            if (_connections > 0 && --_connections <= 0)
            {
                Log.Info("All clients disconnected, suspending monitoring...");

                _monitoringService.StopMonitoring();
                _connections = 0;
            }

            return base.OnDisconnected(stopCalled);
        }
    }
}