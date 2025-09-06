using System.Reflection;
using Overseer.Server.Data;

namespace Overseer.Server.Updates
{
  /// <summary>
  /// This will apply any data "schema" transformations required for new versions of the software.
  /// The V1 patches have been removed, but for now it's should still be possible to update from the latest version of v1
  /// to v2.
  /// </summary>
  public class UpdateManager
  {
    public static bool Update()
    {
      using var context = new LiteDataContext();
      var dbFilePath = context.GetDefaultPath();
      var dbBackupFilePath = context.GetBackupPath();
      var valueStore = context.ValueStore();

      //this will be the version of the last time the app was run.
      var lastRunVersion = Version.Parse(valueStore.Get<string>("lastRunVersion") ?? "0.0.0.0");
      var currentVersion = Assembly.GetExecutingAssembly().GetName().Version;

      //only run if the last version was less than the current version
      if (lastRunVersion < currentVersion)
      {
        try
        {
          //find all update implementations that are greater than the last run version
          var patches = typeof(IPatch)
            .GetAssignableTypes()
            .Select(updateType => Activator.CreateInstance(updateType) as IPatch)
            .Where(patch => patch != null)
            .Where(patch => patch!.Version > lastRunVersion)
            .OrderBy(patch => patch!.Version)
            .ToList();

          if (patches.Count != 0)
          {
            Console.WriteLine($"{patches.Count} patches found...");

            //create a copy of the database before attempting the patching
            File.Copy(dbFilePath, dbBackupFilePath, true);

            patches.ForEach(patch =>
            {
              Console.WriteLine($"Applying Patch {patch!.Version}...");
              patch.Execute(context);
            });

            File.Delete(context.GetBackupPath());
          }
        }
        catch (Exception ex)
        {
          Console.WriteLine($"The update process failed to complete. Please create an issue with the following error details: {ex}");
          //dispose of the context to release the database file
          context.Dispose();
          //restore the backup
          File.Move(dbBackupFilePath, dbFilePath, true);

          return false;
        }

        valueStore.Put("lastRunVersion", currentVersion.ToString());
        context.Dispose();
        Console.WriteLine("Update Successful!");
      }

      return true;
    }
  }
}
