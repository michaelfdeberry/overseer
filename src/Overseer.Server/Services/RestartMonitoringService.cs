using log4net;
using Overseer.Server.Channels;
using Overseer.Server.Machines;

namespace Overseer.Server.Services;

/// <summary>
/// Service that listens for restart requests from the <see cref="IRestartMonitoringChannel"/> and restarts the monitoring service.
/// </summary>
public class RestartMonitoringService(IRestartMonitoringChannel restartMonitoringChannel, IMonitoringService monitoringService) : BackgroundService
{
  static readonly ILog Log = LogManager.GetLogger(nameof(RestartMonitoringService));
  readonly Guid _subscriberId = Guid.NewGuid();

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        if (await restartMonitoringChannel.ReadAsync(_subscriberId, stoppingToken))
        {
          monitoringService.RestartMonitoring();
        }
      }
      catch (Exception ex)
      {
        Log.Error("Error processing settings change", ex);
      }
    }
  }
}
