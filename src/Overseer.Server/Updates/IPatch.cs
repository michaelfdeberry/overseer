using Overseer.Server.Data;

namespace Overseer.Server.Updates
{
  public interface IPatch
  {
    Version Version { get; }

    void Execute(LiteDataContext context);
  }
}
