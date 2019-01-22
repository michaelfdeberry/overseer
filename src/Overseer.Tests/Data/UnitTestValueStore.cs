using Overseer.Data;
using System;
using System.Collections.Generic;

namespace Overseer.Tests.Data
{
	public class UnitTestValueStore : IValueStore
	{
		Dictionary<string, object> _values = new Dictionary<string, object>();

		public T Get<T>()
		{
			return Get<T>(typeof(T).Name);
		}

		public T Get<T>(string key)
		{
			if (!_values.ContainsKey(key)) return default(T);

			return (T)_values[typeof(T).Name];
		}

		public T GetOrPut<T>(Func<T> putFunc)
		{
			return GetOrPut<T>(typeof(T).Name, putFunc);
		}

		public T GetOrPut<T>(string key, Func<T> putFunc)
		{
			if (!_values.ContainsKey(key))
			{
				_values[key] = putFunc();
			}

			return (T)_values[key];
		}

		public void Put<T>(T value)
		{
			Put<T>(typeof(T).Name, value);
		}

		public void Put<T>(string key, T value)
		{
			_values[key] = value;
		}
	}
}
