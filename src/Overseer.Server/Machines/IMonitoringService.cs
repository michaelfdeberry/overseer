namespace Overseer.Server.Machines
{
  public interface IMonitoringService : IDisposable
  {
    void StartMonitoring();
    void StopMonitoring();
    void RestartMonitoring();
  }
}
