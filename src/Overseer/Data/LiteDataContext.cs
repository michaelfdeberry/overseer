using LiteDB;
using System;
using System.Collections.Concurrent;
using System.IO;

namespace Overseer.Data
{
	public class LiteDataContext : IDataContext
	{
		public static readonly string DatabasePath = "Overseer.db";
		public static readonly string DatabaseBackupPath = $"{DatabasePath}.backup";
		
		readonly ConcurrentDictionary<Type, object> _repositoryCache = new ConcurrentDictionary<Type, object>();

		public LiteDatabase Database { get; }

		public LiteDataContext()
			: this(DatabasePath)
		{
		}

		public LiteDataContext(string connectionString)
		{
			Database = new LiteDatabase(connectionString); 
		}

		public IRepository<T> GetRepository<T>() where T : IEntity
		{
			return (IRepository<T>)_repositoryCache.GetOrAdd(typeof(T), type =>
			{
				return new LiteRepository<T>(Database);
			});
		}

		public IValueStore GetValueStore()
		{
			return new LiteValueStore(Database);
		}

		public void Dispose()
		{
			Database.Dispose();
		}
	}
}