using System.Collections.Concurrent;
using log4net;
using Overseer.Server.Channels;
using Overseer.Server.Data;
using Overseer.Server.Integration.Machines;
using Overseer.Server.Machines;
using Overseer.Server.Models;

namespace Overseer.Server.Services;

public sealed class JobSentinelService(
  IDataContext dataContext,
  INotificationChannel notificationChannel,
  IRestartMonitoringChannel restartMonitoringChannel,
  Settings.IConfigurationManager configurationManager,
  Func<Machine, MachineJob, JobSentinel> createSentinel
) : BackgroundService, IAsyncDisposable
{
  private static readonly ILog log = LogManager.GetLogger(typeof(JobSentinelService));
  private readonly Guid _notificationsSubscriberId = Guid.NewGuid();
  private readonly Guid _restartSubscriberId = Guid.NewGuid();
  private readonly ConcurrentDictionary<int, JobSentinel> _activeSentinels = new();
  private readonly IRepository<MachineJob> _jobRepository = dataContext.Repository<MachineJob>();

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    await TrackMonitoringRestarts(stoppingToken);
    await TrackJobNotifications(stoppingToken);
    await Task.Delay(Timeout.Infinite, stoppingToken);
  }

  private async Task TrackMonitoringRestarts(CancellationToken stoppingToken)
  {
    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        if (await restartMonitoringChannel.ReadAsync(_restartSubscriberId, stoppingToken))
        {
          await StopAllSentinels();

          var settings = configurationManager.GetApplicationSettings();
          if (settings.EnableAiMonitoring)
          {
            StartJobSentinels(stoppingToken);
          }
        }
      }
      catch (Exception ex)
      {
        log.Error("Error monitoring settings changes in JobSentinelService", ex);
      }
    }
  }

  private async Task TrackJobNotifications(CancellationToken stoppingToken)
  {
    var settings = configurationManager.GetApplicationSettings();
    if (settings.EnableAiMonitoring)
    {
      StartJobSentinels(stoppingToken);
    }

    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        var notification = await notificationChannel.ReadAsync(_notificationsSubscriberId, stoppingToken);
        var latestSettings = configurationManager.GetApplicationSettings();
        if (settings.EnableAiMonitoring != latestSettings.EnableAiMonitoring)
        {
          if (latestSettings.EnableAiMonitoring)
          {
            StartJobSentinels(stoppingToken);
          }
          else
          {
            await StopAllSentinels();
          }
          settings = latestSettings;
          continue;
        }

        // if monitoring is disabled, skip processing notifications
        if (!settings.EnableAiMonitoring)
          continue;

        if (notification is not JobNotification jobNotification)
          continue;

        switch (jobNotification.Type)
        {
          case JobNotificationType.JobStarted:
            var job = _jobRepository.GetById(jobNotification.MachineJobId);
            if (job != null)
            {
              StartJobSentinel(job, stoppingToken);
            }
            break;
          case JobNotificationType.JobCompleted:
            await StopJobSentinel(jobNotification.MachineJobId);
            break;
        }
      }
      catch (Exception ex)
      {
        log.Error("Error processing job notification in JobSentinelService", ex);
      }
    }

    await StopAllSentinels();
  }

  private void StartJobSentinels(CancellationToken stoppingToken)
  {
    try
    {
      var activeJobs = _jobRepository.Filter(x => !x.EndTime.HasValue);
      foreach (var job in activeJobs)
      {
        StartJobSentinel(job, stoppingToken);
      }
    }
    catch (Exception ex)
    {
      log.Error("Error initializing active sentinels", ex);
    }
  }

  private void StartJobSentinel(MachineJob job, CancellationToken stoppingToken)
  {
    var machineRepository = dataContext.Repository<Machine>();
    var machine = machineRepository.GetById(job.MachineId);
    if (machine.Disabled)
    {
      log.Info($"Machine {machine.Name} is disabled. Sentinel not created for job {job.Id}");
      return;
    }

    if (string.IsNullOrEmpty(machine?.WebcamUrl))
    {
      log.Warn($"Machine {machine?.Name} does not have a valid Webcam URL. Sentinel not created for job {job.Id}");
      return;
    }

    var sentinel = createSentinel(machine, job);
    if (!_activeSentinels.TryAdd(job.Id, sentinel))
    {
      log.Warn($"Sentinel already exists for job {job.Id}");
      sentinel.Dispose(); // Clean up the unused sentinel
      return;
    }

    sentinel.StartMonitoring(stoppingToken);
    log.Info($"Started job sentinel for job {job.Id} on machine {machine.Name}");
  }

  private async Task StopJobSentinel(int jobId)
  {
    if (_activeSentinels.TryRemove(jobId, out var sentinel))
    {
      try
      {
        await sentinel.StopMonitoring();
      }
      catch (Exception ex)
      {
        log.Error($"Error stopping sentinel for job {jobId}", ex);
      }
      finally
      {
        sentinel.Dispose();
      }

      log.Info($"Stopped job sentinel for job {jobId}");
    }
  }

  private async Task StopAllSentinels()
  {
    var sentinelIds = _activeSentinels.Keys.ToList();
    foreach (var jobId in sentinelIds)
    {
      await StopJobSentinel(jobId);
    }
  }

  public async ValueTask DisposeAsync()
  {
    await StopAllSentinels();
    GC.SuppressFinalize(this);
  }
}
