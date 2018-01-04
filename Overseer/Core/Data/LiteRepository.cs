using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using LiteDB;

namespace Overseer.Core.Data
{
    public class LiteRepository<T> : IRepository<T> where T : IEntity, new()
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

        public IReadOnlyList<T> GetList(Expression<Func<T, bool>> predicate)
        {
            return _collection.Find(predicate).ToList();
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

        public void Delete(T entity)
        {
            Delete(entity.Id);
        }
    }
}