using Overseer.Data;
using System;
using System.Collections.Generic;

namespace Overseer.Tests.Data
{
	public class UnitTestContext : IDataContext
    {
        readonly Dictionary<Type, object> _repositoryCache = new Dictionary<Type, object>();
		readonly IValueStore _valueStore = new UnitTestValueStore();

        public IRepository<T> GetRepository<T>() where T : IEntity
        {
            var repositoryType = typeof(T);
            if (_repositoryCache.TryGetValue(repositoryType, out object repository))
                return repository as IRepository<T>;
            
            repository = new UnitTestRepository<T>();
            _repositoryCache.Add(repositoryType, repository);

            return (IRepository<T>)repository;
        }

        public object GetRepository(Type entityType)
        {
            throw new NotImplementedException();
        }
		
		public IValueStore GetValueStore()
		{
			return _valueStore;
		}

		public void Dispose()
		{
		}
	}
}
