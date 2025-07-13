using LiteDB;

namespace Overseer.Server.Data
{
  public class LiteValueStore(LiteDatabase database) : IValueStore
  {
    public class ValueRecord
    {
      public string? Id { get; set; }

      public object? Value { get; set; }
    }

    readonly ILiteCollection<ValueRecord> _valueCollection = database.GetCollection<ValueRecord>(nameof(ValueRecord));

    public T? Get<T>()
    {
      return Get<T>(typeof(T).Name);
    }

    public void Put<T>(T value)
    {
      Put(typeof(T).Name, value);
    }

    public T GetOrPut<T>(Func<T> putFunc)
    {
      return GetOrPut(typeof(T).Name, putFunc);
    }

    public T? Get<T>(string key)
    {
      var record = _valueCollection.FindById(key);
      if (record?.Value is null)
        return default;

      return (T)record.Value;
    }

    public void Put<T>(string key, T value)
    {
      _valueCollection.Upsert(new ValueRecord { Id = key, Value = value });
    }

    public T GetOrPut<T>(string key, Func<T> putFunc)
    {
      var record = _valueCollection.FindById(key);
      if (record?.Value is null)
      {
        var value = putFunc();
        record = new ValueRecord { Id = key, Value = value };

        _valueCollection.Insert(record);
        return value;
      }

      return (T)record.Value;
    }
  }
}
