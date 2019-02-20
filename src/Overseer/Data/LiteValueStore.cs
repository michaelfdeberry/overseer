using System;
using LiteDB;

namespace Overseer.Data
{
    public class LiteValueStore : IValueStore
    {
        public class ValueRecord
        {
            public string Id { get; set; }

            public object Value { get; set; }
        }

        readonly LiteCollection<ValueRecord> _valueCollection;

        public LiteValueStore(LiteDatabase database)
        {
            _valueCollection = database.GetCollection<ValueRecord>(nameof(ValueRecord));
        }

        public T Get<T>()
        {
            return Get<T>(typeof(T).Name);
        }

        public void Put<T>(T value)
        {
            Put(typeof(T).Name, value);
        }

        public T GetOrPut<T>(Func<T> putFunc)
        {
            return GetOrPut<T>(typeof(T).Name, putFunc);
        }

        public T Get<T>(string key)
        {
            var record = _valueCollection.FindById(key);
            if (record == null) return default(T);

            return (T)record.Value;
        }

        public void Put<T>(string key, T value)
        {
            _valueCollection.Upsert(new ValueRecord
            {
                Id = key,
                Value = value
            });
        }

        public T GetOrPut<T>(string key, Func<T> putFunc)
        {
            var record = _valueCollection.FindById(key);
            if (record == null)
            {
                record = new ValueRecord
                {
                    Id = key,
                    Value = putFunc()
                };

                _valueCollection.Insert(record);
            }

            return (T)record.Value;
        }

    }
}
