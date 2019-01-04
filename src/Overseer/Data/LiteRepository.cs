using LiteDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Overseer.Data
{
	public class LiteRepository<T> : IRepository<T> where T : IEntity
    {
        readonly LiteCollection<T> _collection;
		
        public LiteRepository(LiteDatabase database)
        {
            _collection = database.GetCollection<T>(typeof(T).Name);
        }

        public IReadOnlyList<T> GetAll()
        {
            return _collection.FindAll().ToList();
        }
		 
        public T GetById(int id)
        {
            return _collection.FindById(id);
        }

        public T Get(Expression<Func<T, bool>> predicate)
        {
            return _collection.FindOne(predicate);
        }

        public void Create(T entity)
        {
            _collection.Insert(entity);
        }

        public void Update(T entity)
        {
            _collection.Update(entity);
        }

        public void Delete(int id)
        {
            _collection.Delete(id);
		}
		
        public bool Exist(Expression<Func<T, bool>> predicate)
        {
            return _collection.FindOne(predicate) != null;
        }

		public int Count()
		{
			return _collection.Count();
		}
    }
}