using System.Collections.Concurrent;
using log4net;
using Overseer.Server.Automation;
using Overseer.Server.Channels;
using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Services;

public class JobSentinelService(
  IDataContext dataContext,
  IHttpClientFactory httpClientFactory,
  IJobFailureDetectionService failureDetectionService,
  Settings.IConfigurationManager configurationManager,
  INotificationChannel notificationChannel,
  IJobFailureChannel jobFailureChannel
) : BackgroundService
{
  private static readonly ILog log = LogManager.GetLogger(typeof(JobSentinelService));
  private readonly Guid _subscriberId = Guid.NewGuid();
  private readonly ConcurrentDictionary<int, JobSentinelConfig> _activeSentinels = new();
  private readonly HttpClient _httpClient = httpClientFactory.CreateClient();
  private TimeSpan _captureInterval;

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    var settings = configurationManager.GetApplicationSettings();
    if (!settings.EnabledAiMonitoring)
    {
      return;
    }

    _captureInterval = TimeSpan.FromMinutes(settings.AiMonitoringScanInterval);

    // Start sentinels for all currently active jobs
    await InitializeActiveSentinels(stoppingToken);

    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        // Listen for job events
        var notification = await notificationChannel.ReadAsync(_subscriberId, stoppingToken);
        if (notification is not JobNotification jobNotification)
          continue;

        switch (jobNotification.Type)
        {
          case JobNotificationType.JobStarted:
            var machineRepository = dataContext.Repository<Machine>();
            var machine = machineRepository.GetById(jobNotification.MachineId);

            if (machine != null && !string.IsNullOrEmpty(machine.WebCamUrl))
            {
              var jobRepository = dataContext.Repository<MachineJob>();
              var job = jobRepository.GetById(jobNotification.MachineJobId);

              if (job != null)
              {
                await StartJobSentinel(machine, job, stoppingToken);
              }
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

  private async Task InitializeActiveSentinels(CancellationToken stoppingToken)
  {
    try
    {
      var jobRepository = dataContext.Repository<MachineJob>();
      var machineRepository = dataContext.Repository<Machine>();
      var activeJobs = jobRepository.Filter(x => !x.EndTime.HasValue);

      foreach (var job in activeJobs)
      {
        var machine = machineRepository.GetById(job.MachineId);
        if (machine != null && !string.IsNullOrEmpty(machine.WebCamUrl))
        {
          await StartJobSentinel(machine, job, stoppingToken);
        }
      }
    }
    catch (Exception ex)
    {
      log.Error("Error initializing active sentinels", ex);
    }
  }

  private Task StartJobSentinel(Machine machine, MachineJob job, CancellationToken stoppingToken)
  {
    if (_activeSentinels.ContainsKey(job.Id))
    {
      log.Warn($"Sentinel already exists for job {job.Id}");
      return Task.CompletedTask;
    }

    var config = new JobSentinelConfig
    {
      Machine = machine,
      Job = job,
      LastImageCapture = null,
      LastCaptureTime = DateTime.MinValue,
    };

    _activeSentinels[job.Id] = config;

    // Start the sentinel monitoring task
    _ = Task.Run(async () => await MonitorJob(config, stoppingToken), stoppingToken);

    log.Info($"Started job sentinel for job {job.Id} on machine {machine.Name}");
    return Task.CompletedTask;
  }

  private Task StopJobSentinel(int jobId)
  {
    if (_activeSentinels.TryRemove(jobId, out var config))
    {
      config.CancellationTokenSource.Cancel();
      config.CancellationTokenSource.Dispose();
      log.Info($"Stopped job sentinel for job {jobId}");
    }
    return Task.CompletedTask;
  }

  private async Task StopAllSentinels()
  {
    var sentinelIds = _activeSentinels.Keys.ToList();
    foreach (var jobId in sentinelIds)
    {
      await StopJobSentinel(jobId);
    }
  }

  private async Task MonitorJob(JobSentinelConfig config, CancellationToken stoppingToken)
  {
    var combinedToken = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken, config.CancellationTokenSource.Token).Token;
    while (!combinedToken.IsCancellationRequested)
    {
      try
      {
        await Task.Delay(_captureInterval, combinedToken);

        if (combinedToken.IsCancellationRequested)
          break;

        await CaptureAndAnalyzeImage(config, combinedToken);
      }
      catch (Exception ex)
      {
        log.Error($"Error monitoring job {config.Job.Id}", ex);
      }
    }
  }

  private async Task CaptureAndAnalyzeImage(JobSentinelConfig config, CancellationToken cancellationToken)
  {
    var currentImage = await CaptureWebcamImage(config.Machine.WebCamUrl!, cancellationToken);
    if (currentImage == null)
    {
      log.Warn($"Failed to capture webcam image for machine {config.Machine.Name}");
      return;
    }

    // If this is the first capture, just store it and continue
    if (config.LastImageCapture == null)
    {
      config.LastImageCapture = currentImage;
      config.LastCaptureTime = DateTime.UtcNow;
      return;
    }

    // Analyze the images for job failure
    var analysisResult = await failureDetectionService.AnalyzeForJobFailureAsync(config.Job.Id, config.LastImageCapture, currentImage);
    if (analysisResult.IsFailureDetected)
    {
      await jobFailureChannel.WriteAsync(analysisResult, cancellationToken);
    }

    // Update the stored image
    config.LastImageCapture = currentImage;
    config.LastCaptureTime = DateTime.UtcNow;
  }

  private async Task<byte[]?> CaptureWebcamImage(string webcamUrl, CancellationToken cancellationToken)
  {
    try
    {
      using var response = await _httpClient.GetAsync(webcamUrl, cancellationToken);
      if (response.IsSuccessStatusCode)
      {
        return await response.Content.ReadAsByteArrayAsync(cancellationToken);
      }

      log.Warn($"Failed to capture webcam image. Status: {response.StatusCode}");
      return null;
    }
    catch (Exception ex)
    {
      log.Error($"Error capturing webcam image from {webcamUrl}", ex);
      return null;
    }
  }

  public override void Dispose()
  {
    _httpClient?.Dispose();
    base.Dispose();
  }
}
