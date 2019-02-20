using System;

namespace Overseer.Data
{
    public interface IDataContext : IDisposable
    {
        IRepository<T> GetRepository<T>() where T : IEntity;

        IValueStore GetValueStore();
    }
}