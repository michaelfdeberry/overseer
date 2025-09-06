using log4net;
using Microsoft.AspNetCore.SignalR;
using Overseer.Server.Channels;
using Overseer.Server.Hubs;

namespace Overseer.Server.Services;

/// <summary>
/// Service that listens for machine status updates from the <see cref="IMachineStatusChannel"/> and sends them to connected clients via SignalR.
/// </summary>
public class MachineStatusUpdateService(IHubContext<StatusHub> hubContext, IMachineStatusChannel machineStatusChannel) : BackgroundService
{
  static readonly ILog Log = LogManager.GetLogger(nameof(MachineStatusUpdateService));
  readonly Guid _subscriberId = Guid.NewGuid();

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        var statusUpdate = await machineStatusChannel.ReadAsync(_subscriberId, stoppingToken);
        if (statusUpdate != null)
        {
          await hubContext.Clients.Group(StatusHub.MonitoringGroupName).SendAsync("StatusUpdate", statusUpdate, cancellationToken: stoppingToken);
        }
      }
      catch (Exception ex)
      {
        Log.Error("Error processing status update", ex);
      }
    }
  }
}
