using System;

namespace Overseer.Core.Data
{
    public interface IDataContext : IDisposable
    {
        IRepository<T> GetRepository<T>() where T : IEntity, new();

        object GetRepository(Type entityType);
    }
}