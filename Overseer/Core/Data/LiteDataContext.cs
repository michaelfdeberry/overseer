using LiteDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Overseer.Core.Data
{
    public class LiteDataContext : IDataContext
    {
        readonly LiteDatabase _database;
        readonly MethodInfo _genericCreateRepository;
        readonly Dictionary<Type, object> _repositoryCache = new Dictionary<Type, object>();

        public LiteDataContext()
        {
            _database = new LiteDatabase("Overseer.db");
            var methods = GetType().GetMethods();
            _genericCreateRepository = methods.FirstOrDefault(x => x.IsGenericMethod);
        }

        public IRepository<T> GetRepository<T>() where T : IEntity, new()
        {
            if (_repositoryCache.ContainsKey(typeof(T)))
                return _repositoryCache[typeof(T)] as IRepository<T>;

            var repository = new LiteRepository<T>(_database);
            _repositoryCache.Add(typeof(T), repository);

            return repository;
        }

        public object GetRepository(Type entityType)
        {
            if (!typeof(IEntity).IsAssignableFrom(entityType))
                throw new ArgumentException("Unsupported Type");

            if (_repositoryCache.ContainsKey(entityType))
                return _repositoryCache[entityType];

            var method = _genericCreateRepository.MakeGenericMethod(entityType);
            return method.Invoke(this, null);
        }

        public void Dispose()
        {
            _database.Dispose();
        }
    }
}