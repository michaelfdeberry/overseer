using Overseer.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Overseer.Tests.Data
{
	public class UnitTestRepository<T> : IRepository<T> where T : IEntity
    {
        readonly List<T> _entities = new List<T>();

        public IReadOnlyList<T> GetAll()
        {
            return _entities;
        }

        public IReadOnlyList<T> GetList(Expression<Func<T, bool>> predicate)
        {
            return _entities.Where(predicate.Compile()).ToList();
        }

        public T GetById(int id)
        {
            return _entities.FirstOrDefault(x => x.Id == id);
		}

		public T Get(Expression<Func<T, bool>> predicate)
		{
			return _entities.FirstOrDefault(predicate.Compile());
		}

		public void Create(T entity)
        {
            entity.Id = _entities.Count > 0 ? _entities.Max(x => x.Id) + 1 : 1;
            _entities.Add(entity);
        }

        public void Update(T entity)
        {
            Delete(entity.Id);
            _entities.Add(entity);
        }

        public void Delete(int id)
        {
            _entities.RemoveAt(_entities.FindIndex(x => x.Id == id));
        }

        public void Delete(T entity)
        {
            Delete(entity.Id);
        }

        public bool Exist(Expression<Func<T, bool>> predicate)
        {
            return _entities.Any(predicate.Compile());
        }

		public int Count()
		{
			return _entities.Count();
		}

		public void Update(IEnumerable<T> entities)
		{
			entities.ToList().ForEach(Update);
		}
	}
}
