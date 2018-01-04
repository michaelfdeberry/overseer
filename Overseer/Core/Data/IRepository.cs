using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Overseer.Core.Models;

namespace Overseer.Core.Data
{
    public interface IEntity
    {
        int Id { get; set; }
    }

    public interface IRepository<T> where T : IEntity, new()
    {
        IReadOnlyList<T> GetAll();

        IReadOnlyList<T> GetList(Expression<Func<T, bool>> predicate);

        T GetById(int id);

        T Get(Expression<Func<T, bool>> predicate);

        void Create(T entity);

        void Update(T entity);

        void Delete(int id);

        void Delete(T entity);
    }
}