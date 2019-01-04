using Overseer.Data;
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
