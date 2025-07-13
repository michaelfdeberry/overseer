using log4net;
using Overseer.Server.Channels;
using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Services;

public class MachineJobService(IDataContext dataContext, IMachineStatusChannel machineStatusChannel, IAlertChannel alertChannel) : BackgroundService
{
  const int JobUpdateIntervalSeconds = 30;

  static readonly ILog Log = LogManager.GetLogger(typeof(MachineJobService));

  readonly Guid _subscriberId = Guid.NewGuid();
  readonly IRepository<MachineJob> _repository = dataContext.GetRepository<MachineJob>();

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    while (!stoppingToken.IsCancellationRequested)
    {
      MachineStatus? status = null;
      try
      {
        status = await machineStatusChannel.ReadAsync(_subscriberId, stoppingToken);
        if (status is null)
          continue;

        var job = _repository.Get(x => x.MachineId == status.MachineId && !x.EndTime.HasValue);

        async Task SendJobAlert(JobAlertType type, string? message = null)
        {
          await alertChannel.WriteAsync(
            new JobAlert
            {
              Type = type,
              MachineId = status.MachineId,
              MachineJobId = job!.Id,
              Message = message,
            },
            stoppingToken
          );
        }

        if (job is null)
        {
          // the machine is idle and there is no job in progress, nothing to do
          if (status.State == MachineState.Idle)
            continue;

          // the machine is offline and there is no job in progress, nothing to do
          if (status.State == MachineState.Offline)
            continue;

          // the machine is operational and there is no job in progress, create a new job
          job = new MachineJob
          {
            State = status.State,
            MachineId = status.MachineId,
            StartTime = DateTimeOffset.UtcNow.AddSeconds(-status.ElapsedJobTime).ToUnixTimeSeconds(),
            LastUpdate = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            LastStatus = status,
          };
          _repository.Create(job);

          await SendJobAlert(JobAlertType.JobStarted);
          continue;
        }

        // the machine is operational and there is no change in state, nothing to do
        if (job.State == status.State)
        {
          // Adding every update to the database can lead to performance issues,
          // so we only update the job if the last update was more than JobUpdateIntervalSeconds
          var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
          if (!job.LastUpdate.HasValue || now - job.LastUpdate.Value < JobUpdateIntervalSeconds)
          {
            job.LastUpdate = now;
            job.LastStatus = status;
            _repository.Update(job);
          }
          continue;
        }

        // otherwise, the machine is operational and the state has changed
        switch (status.State)
        {
          case MachineState.Offline:
            job.EndTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            job.State = MachineState.Offline;
            await SendJobAlert(JobAlertType.JobError, "job.machineOffline");
            break;

          case MachineState.Idle:
            if (job.LastUpdate.HasValue && job.LastStatus is not null)
            {
              // this should be more accurate than using the current time
              job.EndTime = job.LastUpdate.Value + job.LastStatus.ElapsedJobTime;
            }
            else
            {
              job.EndTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            }
            job.State = MachineState.Idle;
            await SendJobAlert(JobAlertType.JobCompleted);
            break;

          case MachineState.Operational:
            job.State = MachineState.Operational;
            await SendJobAlert(JobAlertType.JobResumed);
            break;

          case MachineState.Paused:
            job.State = MachineState.Paused;
            await SendJobAlert(JobAlertType.JobPaused);
            break;
          default:
            Log.Warn($"Unhandled machine state transition: {job.State} -> {status.State} for machine {status.MachineId}");
            job.State = status.State;
            break;
        }

        job.LastStatus = status;
        job.LastUpdate = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        _repository.Update(job);
      }
      catch (Exception ex)
      {
        Log.Error($"Machine Job Service Error processing machine {status?.MachineId}: {ex.Message}", ex);
      }
    }
  }
}
