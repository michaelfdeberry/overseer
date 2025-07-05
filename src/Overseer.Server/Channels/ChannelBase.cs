using System.Threading.Channels;

namespace Overseer.Server.Channels;

public interface IChannelBase<T>
{
  Task WriteAsync(T item);
  Task<T> ReadAsync();
}

public abstract class UnboundedChannelBase<T>
{
  private readonly Channel<T> _channel;

  public UnboundedChannelBase()
  {
    _channel = Channel.CreateUnbounded<T>(
      new UnboundedChannelOptions
      {
        SingleReader = false,
        SingleWriter = false,
        AllowSynchronousContinuations = true,
      }
    );
  }

  public async Task WriteAsync(T item)
  {
    await _channel.Writer.WriteAsync(item);
  }

  public async Task<T> ReadAsync()
  {
    return await _channel.Reader.ReadAsync();
  }
}
