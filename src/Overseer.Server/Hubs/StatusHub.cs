using log4net;
using Microsoft.AspNetCore.SignalR;

namespace Overseer.Server.Hubs;

public class StatusHub() : Hub
{
  static readonly ILog Log = LogManager.GetLogger(typeof(StatusHub));

  public const string MonitoringGroupName = "MonitoringGroup";

  public async Task StartMonitoring()
  {
    Log.Info($"Client {Context.ConnectionId} started monitoring.");
    await Groups.AddToGroupAsync(Context.ConnectionId, MonitoringGroupName);
  }

  public override async Task OnDisconnectedAsync(Exception? exception)
  {
    Log.Info($"Client {Context.ConnectionId} disconnected.");
    await Groups.RemoveFromGroupAsync(Context.ConnectionId, MonitoringGroupName);
    await base.OnDisconnectedAsync(exception);
  }
}
