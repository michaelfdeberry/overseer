using log4net;
using Overseer.Server.Machines;
using IConfigurationManager = Overseer.Server.Settings.IConfigurationManager;

namespace Overseer.Server.Machines;

public sealed class MonitoringService : IDisposable, IMonitoringService
{
  static readonly ILog Log = LogManager.GetLogger(typeof(MonitoringService));

  readonly IMachineManager _machineManager;
  readonly IConfigurationManager _configurationManager;
  readonly MachineProviderManager _providerManager;

  public MonitoringService(IMachineManager machineManager, IConfigurationManager configurationManager, MachineProviderManager providerManager)
  {
    _machineManager = machineManager;
    _providerManager = providerManager;
    _configurationManager = configurationManager;

    StartMonitoring();
  }

  public void StartMonitoring()
  {
    Log.Info("Starting monitoring service");
    var interval = _configurationManager.GetApplicationSettings().Interval;
    var providers = _providerManager.GetProviders(_machineManager.GetMachines());
    foreach (var provider in providers)
    {
      provider.Start(interval);
    }
  }

  public void StopMonitoring()
  {
    Log.Info("Stopping monitoring service");
    var providers = _providerManager.GetProviders(_machineManager.GetMachines());
    foreach (var provider in providers)
    {
      provider.Stop();
    }
  }

  public void RestartMonitoring()
  {
    Log.Info("Restarting monitoring service");
    StopMonitoring();
    StartMonitoring();
  }

  public void Dispose()
  {
    Log.Info("Disposing monitoring service");
    StopMonitoring();
  }
}
