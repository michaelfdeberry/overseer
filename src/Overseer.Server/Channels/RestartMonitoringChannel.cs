namespace Overseer.Server.Channels;

public interface IRestartMonitoringChannel : IChannelBase<bool>
{
  Task Dispatch();
}

public class RestartMonitoringChannel : UnboundedChannelBase<bool>, IRestartMonitoringChannel
{
  public async Task Dispatch()
  {
    await WriteAsync(true);
  }
}
