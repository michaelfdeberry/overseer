using log4net;
using Microsoft.AspNetCore.SignalR;

namespace Overseer.Server.Hubs;

public class NotificationHub : Hub
{
  private static readonly ILog Log = LogManager.GetLogger(typeof(NotificationHub));

  public const string NotificationGroupName = "NotificationGroup";

  public override async Task OnConnectedAsync()
  {
    Log.Info($"Client {Context.ConnectionId} subscribed to notifications.");
    await Groups.AddToGroupAsync(Context.ConnectionId, NotificationGroupName);
    await base.OnConnectedAsync();
  }

  public override async Task OnDisconnectedAsync(Exception? exception)
  {
    Log.Info($"Client {Context.ConnectionId} disconnected from notifications.");
    await Groups.RemoveFromGroupAsync(Context.ConnectionId, NotificationGroupName);
    await base.OnDisconnectedAsync(exception);
  }
}
