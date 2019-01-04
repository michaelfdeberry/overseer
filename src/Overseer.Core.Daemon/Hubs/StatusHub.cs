using log4net;
using Microsoft.AspNetCore.SignalR;
using Overseer.Models;
using System;
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

		public async Task StartMonitoring()
		{
			MonitoringGroup.Add(Context.ConnectionId);
			await Groups.AddToGroupAsync(Context.ConnectionId, MonitoringGroupName);

			if (!_monitoringService.Enabled)
			{
				Log.Info("A client connected, initiating monitoring...");
				_monitoringService.StartMonitoring();
				_monitoringService.PollProviders();
			}
		}

		public void PollProviders()
		{
			_monitoringService.PollProviders();
		}

		public override async Task OnDisconnectedAsync(Exception exception)
		{
			MonitoringGroup.Remove(Context.ConnectionId);
			if (!MonitoringGroup.Any())
			{
				_monitoringService.StopMonitoring();
			}

			await base.OnDisconnectedAsync(exception);
		}

		public static void PushStatusUpdate(IHubContext<StatusHub> hubContext, MachineStatus status)
		{
			hubContext
				.Clients
				.Group(MonitoringGroupName)
				.SendAsync("StatusUpdate", status);
		}
	}
}
