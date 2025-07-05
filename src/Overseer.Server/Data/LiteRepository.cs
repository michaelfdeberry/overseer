using System.Linq.Expressions;
using LiteDB;

namespace Overseer.Server.Data;

public class LiteRepository<T>(LiteDatabase database) : IRepository<T>
  where T : IEntity
{
  readonly ILiteCollection<T> _collection = database.GetCollection<T>(typeof(T).Name);

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

  public void Update(IEnumerable<T> entities)
  {
    _collection.Update(entities);
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

  public int Count(Expression<Func<T, bool>> predicate)
  {
    return _collection.Count(predicate);
  }
}
