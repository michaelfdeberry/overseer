namespace Overseer.Server.Channels;

public interface IRestartMonitoringChannel : IChannelBase<bool>
{
  Task Dispatch(CancellationToken cancellationToken = default);
}

public class RestartMonitoringChannel : ChannelBase<bool>, IRestartMonitoringChannel
{
  public async Task Dispatch(CancellationToken cancellationToken = default)
  {
    await WriteAsync(true, cancellationToken);
  }
}
