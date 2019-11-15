using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Overseer.Data
{
    public interface IEntity
    {
        int Id { get; set; }
    }

    public interface IRepository<T> where T : IEntity
    {
        IReadOnlyList<T> GetAll();
        
        T GetById(int id);

        T Get(Expression<Func<T, bool>> predicate);

        void Create(T entity);

        void Update(T entity);

        void Update(IEnumerable<T> entities);

        void Delete(int id);

        bool Exist(Expression<Func<T, bool>> predicate);

        int Count();

        int Count(Expression<Func<T, bool>> predicate);
    }
}