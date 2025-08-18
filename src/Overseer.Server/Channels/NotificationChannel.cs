using Overseer.Server.Models;

namespace Overseer.Server.Channels;

public interface INotificationChannel : IChannelBase<Notification>;

public class NotificationChannel : ChannelBase<Notification>, INotificationChannel { }
