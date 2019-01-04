using log4net;
using Overseer.Data;
using Overseer.Updates;
using System;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Overseer
{
	/// <summary>
	/// This will apply any data "schema" transformations required for new versions of the software.
	/// </summary>
	public class UpdateManager
	{
		static readonly ILog Log = LogManager.GetLogger(typeof(UpdateManager));

		public static bool Update()
		{
			if (!File.Exists(LiteDataContext.DatabasePath)) return true;
			var context = new LiteDataContext();
			var valueStore = context.GetValueStore();

			//this will be the version of the last time the app was run.
			var lastRunVersion = Version.Parse(valueStore.Get<string>("lastRunVersion") ?? "0.0.0.0");
			var currentVersion = Assembly.GetExecutingAssembly().GetName().Version;			

			//only run if the last version was less than the current version
			if (lastRunVersion < currentVersion)
			{
				try
				{
					//find all update implementations that are greater than the last run version
					//and less than or equal to the current version
					var patches = typeof(IPatch).GetAssignableTypes()
						.Select(updateType => (IPatch)Activator.CreateInstance(updateType))
						.Where(patch => patch.Version > lastRunVersion && patch.Version <= currentVersion)
						.OrderBy(patch => patch.Version)
						.ToList();

					if (patches.Any())
					{
						Log.Info($"{patches.Count} patches found...");

						//create a copy of the database before attempting the patching
						File.Copy(LiteDataContext.DatabasePath, LiteDataContext.DatabaseBackupPath);

						patches.ForEach(patch =>
						{
							Log.Info($"Applying Patch {patch.Version}...");
							patch.Execute(context);
							Log.Info($"Patch {patch.Version} completed!");
						});

						File.Delete(LiteDataContext.DatabaseBackupPath);
						valueStore.Put("lastRunVersion", currentVersion.ToString());
						context.Dispose();
						Log.Info("Update Successful!");
					}
				}
				catch (Exception ex)
				{
					Log.Error("The update process failed to complete. Please create an issue with the following error details", ex);

					//dispose of the context to release the database file
					context.Dispose();
					//delete the working copy of the database
					File.Delete(LiteDataContext.DatabasePath);
					//restore the backup
					File.Move(LiteDataContext.DatabaseBackupPath, LiteDataContext.DatabasePath);

					return false;
				}
			}

			return true;
		}
	}
}
