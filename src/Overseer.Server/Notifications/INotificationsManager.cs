using Overseer.Server.Models;

namespace Overseer.Server.Notifications;

public interface INotificationsManager
{
  void CreateNotification(Notification notification);
  void Delete(int id);
  void DeleteAll();
  IEnumerable<Notification> GetNotifications();
  void MarkAsRead(List<int> ids);
  void PruneNotifications();
}
