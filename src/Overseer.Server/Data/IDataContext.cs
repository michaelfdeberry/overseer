namespace Overseer.Server.Data;

public interface IDataContext : IDisposable
{
  IRepository<T> Repository<T>()
    where T : IEntity;

  IValueStore ValueStore();
}
