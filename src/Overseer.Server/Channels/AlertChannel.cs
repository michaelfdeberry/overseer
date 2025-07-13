using Overseer.Server.Models;

namespace Overseer.Server.Channels;

public interface IAlertChannel : IChannelBase<Alert>;

public class AlertChannel : ChannelBase<Alert>, IAlertChannel { }
