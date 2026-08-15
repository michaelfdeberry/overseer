using System.IO.Compression;
using System.Text.Json;
using log4net;
using Octokit;
using Overseer.Server.Plugins.Models;
using FileMode = System.IO.FileMode;

namespace Overseer.Server.Plugins;

public class PluginManager(IHttpClientFactory httpClientFactory, IGitHubClient gitHubClient) : IPluginManager
{
  static readonly JsonSerializerOptions JsonSerializerOptions = new() { PropertyNameCaseInsensitive = true };

  static readonly ILog Log = LogManager.GetLogger(typeof(PluginManager));

  private static readonly string RegistryUrl = "https://raw.githubusercontent.com/OverseerApp/overseer.plugin-registry/refs/heads/main/plugins.json";

  private readonly HttpClient _httpClient = httpClientFactory.CreateClient();

  public async Task<IEnumerable<PluginRegistryItem>> GetRegistryItems()
  {
    string response;
    try
    {
      response = await _httpClient.GetStringAsync(RegistryUrl);
    }
    catch (Exception ex)
    {
      Log.Error($"Failed to fetch plugin registry from '{RegistryUrl}': {ex.Message}", ex);
      throw new Exception($"Failed to fetch plugin registry from '{RegistryUrl}'. See inner exception for details.", ex);
    }
    var items = JsonSerializer.Deserialize<IEnumerable<PluginRegistryItem>>(response, JsonSerializerOptions) ?? [];
    var itemsWithLatestVersion = new List<PluginRegistryItem>();
    var installedPlugins = GetInstalledPlugins().ToDictionary(p => p.Name, p => p.Version);

    foreach (var item in items)
    {
      try
      {
        var updateInfo = await GetPluginInfo(installedPlugins, item);
        if (updateInfo is null)
          continue;

        itemsWithLatestVersion.Add(updateInfo);
      }
      catch (Exception ex)
      {
        Log.Error($"Failed to fetch latest release for plugin {item.Name} from {item.GithubRepository}: {ex.Message}", ex);
        continue;
      }
    }

    return itemsWithLatestVersion;
  }

  private async Task<PluginRegistryItem?> GetPluginInfo(Dictionary<string, string?> installedPlugins, PluginRegistryItem item)
  {
    var (owner, repoName) = PluginUtilities.ParseGitHubUrl(item.GithubRepository);
    var latest = await gitHubClient.Repository.Release.GetLatest(owner, repoName);

    if (latest.Assets.Count == 0)
    {
      Log.Warn($"No assets found for latest release of plugin {item.Name} from {item.GithubRepository}");
      return null;
    }

    var zipFiles = latest.Assets.Where(a => a.Name.EndsWith(".zip")).ToList();
    // there should only be a single zip file.
    if (zipFiles.Count == 0)
    {
      Log.Warn($"No zip asset found for latest release of plugin {item.Name} from {item.GithubRepository}");
      return null;
    }

    if (zipFiles.Count > 1)
    {
      Log.Warn($"Multiple zip assets found for latest release of plugin {item.Name} from {item.GithubRepository}. Using the first one.");
    }

    var zipFile = zipFiles[0];
    var installedVersion = installedPlugins.GetValueOrDefault(item.Name);
    return item with
    {
      Version = latest.TagName,
      DownloadUrl = zipFile.BrowserDownloadUrl,
      IsInstalled = installedVersion != null,
      IsUpdateAvailable = installedVersion != null && installedVersion != latest.TagName,
      InstalledVersion = installedVersion,
    };
  }

  public async Task<bool> InstallPlugin(PluginRegistryItem item)
  {
    try
    {
      var response = await _httpClient.GetAsync(item.DownloadUrl);
      response.EnsureSuccessStatusCode();

      var installPath = Path.Combine(PluginUtilities.GetPluginsPath(), item.Name);
      var pluginZipPath = Path.Combine(Path.GetTempPath(), $"{item.Name}-{item.Version}-{Guid.NewGuid()}.zip");
      await using (var fs = new FileStream(pluginZipPath, FileMode.Create, FileAccess.Write, FileShare.None))
      {
        await response.Content.CopyToAsync(fs);
      }

      // Extract the zip file into a safe temporary location, then move into place.
      SafeExtract(pluginZipPath, item.Name, PluginUtilities.GetPluginsPath());

      // write the item metadata to a file
      var metadataPath = Path.Combine(installPath, "plugin.json");
      var metadataJson = JsonSerializer.Serialize(item);
      await File.WriteAllTextAsync(metadataPath, metadataJson);

      Log.Info($"Successfully installed plugin {item.Name} version {item.Version}");
      return true;
    }
    catch (Exception ex)
    {
      Log.Error($"Failed to install plugin {item.Name}: {ex.Message}", ex);
      return false;
    }
  }

  public IEnumerable<PluginRegistryItem> GetInstalledPlugins()
  {
    return PluginUtilities
      .GetPluginDirectories()
      .Select(PluginUtilities.ReadPluginMetadata)
      .Where(metadata => metadata != null)
      .Cast<PluginRegistryItem>();
  }

  public bool UninstallPlugin(string pluginName)
  {
    try
    {
      var installPath = Path.Combine(PluginUtilities.GetPluginsPath(), pluginName);
      if (Directory.Exists(installPath))
      {
        var metadataPath = Path.Combine(installPath, "plugin.json");
        if (File.Exists(metadataPath))
        {
          File.Delete(metadataPath);
        }
        Log.Info($"Successfully marked plugin {pluginName} for uninstallation, the plugin will be fully removed on next startup.");

        return true;
      }
      else
      {
        Log.Warn($"Plugin {pluginName} not found for uninstallation.");
        return false;
      }
    }
    catch (Exception ex)
    {
      Log.Error($"Failed to uninstall plugin {pluginName}: {ex.Message}", ex);
      return false;
    }
  }

  private static void SafeExtract(string zipPath, string directory, string pluginPath)
  {
    var extractPath = Path.Combine(pluginPath, directory);
    var tempExtractPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString(), directory);
    Directory.CreateDirectory(tempExtractPath);
    var destinationRoot =
      Path.GetFullPath(extractPath).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar;

    try
    {
      using var archive = ZipFile.OpenRead(zipPath);
      foreach (var entry in archive.Entries)
      {
        var entryPath = entry.FullName.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(tempExtractPath, entryPath));

        if (!fullPath.StartsWith(destinationRoot, StringComparison.OrdinalIgnoreCase))
        {
          throw new UnauthorizedAccessException($"Attempted to extract outside of directory: {entry.FullName}");
        }

        if (string.IsNullOrEmpty(entry.Name))
        {
          Directory.CreateDirectory(fullPath);
          continue;
        }

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
        entry.ExtractToFile(fullPath, overwrite: true);
      }

      if (Directory.Exists(extractPath))
      {
        Directory.Delete(extractPath, true);
      }

      Directory.Move(tempExtractPath, extractPath);
    }
    catch (Exception ex)
    {
      Log.Error($"Failed to extract plugin zip file {zipPath}: {ex.Message}", ex);
      throw;
    }
    finally
    {
      if (File.Exists(zipPath))
      {
        File.Delete(zipPath);
      }

      if (Directory.Exists(tempExtractPath))
      {
        Directory.Delete(tempExtractPath, true);
      }
    }
  }
}
