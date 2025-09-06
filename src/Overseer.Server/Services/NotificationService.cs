using log4net;
using Microsoft.AspNetCore.SignalR;
using Overseer.Server.Channels;
using Overseer.Server.Data;
using Overseer.Server.Hubs;
using Overseer.Server.Models;

namespace Overseer.Server.Services;

public class NotificationService(IDataContext dataContext, IHubContext<NotificationHub> notificationHub, INotificationChannel notificationChannel)
  : BackgroundService
{
  private static readonly int MaxNotificationAge = (int)TimeSpan.FromDays(7).TotalMilliseconds;

  private static readonly ILog log = LogManager.GetLogger(typeof(NotificationService));
  private readonly Guid _subscriptionId = Guid.NewGuid();

  private readonly IRepository<Notification> _notifications = dataContext.Repository<Notification>();

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    PushNotifications(stoppingToken).DoNotAwait();
    PruneNotifications(stoppingToken).DoNotAwait();
    await Task.Delay(Timeout.Infinite, stoppingToken);
  }

  private async Task PruneNotifications(CancellationToken stoppingToken)
  {
    try
    {
      while (!stoppingToken.IsCancellationRequested)
      {
        var cutoff = DateTimeOffset.UtcNow.AddMilliseconds(-MaxNotificationAge).ToUnixTimeMilliseconds();
        _notifications.Delete(n => n.Timestamp < cutoff);
        await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
      }
    }
    catch (Exception ex)
    {
      log.Error("Error pruning old notifications in NotificationService", ex);
      throw;
    }
  }

  private async Task PushNotifications(CancellationToken stoppingToken)
  {
    try
    {
      while (!stoppingToken.IsCancellationRequested)
      {
        var notification = await notificationChannel.ReadAsync(_subscriptionId, stoppingToken);
        if (notification == null)
          continue;

        _notifications.Create(notification);
        await notificationHub
          .Clients.Group(NotificationHub.NotificationGroupName)
          .SendAsync("Notification", notification, cancellationToken: stoppingToken);
      }
    }
    catch (Exception ex)
    {
      log.Error("Error pushing notifications", ex);
      throw;
    }
  }
}
