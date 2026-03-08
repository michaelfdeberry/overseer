using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Notifications;

public class NotificationsManager(IDataContext dataContext) : INotificationsManager
{
  private static readonly int MaxNotificationAge = (int)TimeSpan.FromDays(7).TotalMilliseconds;

  private readonly IRepository<Notification> _repository = dataContext.Repository<Notification>();

  private readonly IRepository<MachineJob> _jobRepository = dataContext.Repository<MachineJob>();

  public void CreateNotification(Notification notification)
  {
    _repository.Create(notification);
  }

  public IEnumerable<Notification> GetNotifications()
  {
    var notifications = _repository.GetAll().OrderByDescending(n => n.Timestamp).ToList();
    var jobIds = notifications.OfType<JobNotification>().Select(j => j.MachineJobId).ToHashSet();
    var jobs = _jobRepository.Filter(j => jobIds.Contains(j.Id)).ToDictionary(j => j.Id);

    foreach (var notification in notifications)
    {
      if (notification is JobNotification jobNotification)
      {
        jobs.TryGetValue(jobNotification.MachineJobId, out var job);
        jobNotification.MachineJobState = job?.State ?? Integration.Machines.MachineState.Idle;
      }
    }

    return notifications;
  }

  public void MarkAsRead(List<int> ids)
  {
    var notifications = _repository.Filter(n => ids.Contains(n.Id) && !n.IsRead).ToList();
    foreach (var notification in notifications)
    {
      notification.IsRead = true;
    }

    _repository.Update(notifications);
  }

  public void DeleteAll()
  {
    _repository.DeleteAll();
  }

  public void Delete(int id)
  {
    _repository.Delete(id);
  }

  public void PruneNotifications()
  {
    var cutoff = DateTimeOffset.UtcNow.AddMilliseconds(-MaxNotificationAge).ToUnixTimeMilliseconds();
    _repository.Delete(n => n.Timestamp < cutoff);
  }
}
