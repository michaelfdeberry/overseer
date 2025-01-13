using System;
using System.Collections.Concurrent;
using System.IO;

using log4net;

using LiteDB;

namespace Overseer.Data
{
    public class LiteDataContext : IDataContext
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(LiteDataContext));

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
            var userDirectory = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            var dbPath = Path.Combine(userDirectory, connectionString);

            // if there is no database in the user directory, but there is one 
            // locally move it to the user directory. This moves the db file
            // out of the app directory to avoid potentially being deleted during an update. 
            if (!File.Exists(dbPath) && File.Exists(connectionString))
            {
                try
                {
                    Log.Info($"Moving {connectionString} to {dbPath}...");
                    File.Move(connectionString, dbPath);
                    Log.Info($"Successfully moved {connectionString} to {dbPath}!");
                }
                catch (Exception ex)
                {
                    Log.Error($"Failed to move {connectionString} to {dbPath}.", ex);
                }
            }

            Database = new LiteDatabase(dbPath);
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