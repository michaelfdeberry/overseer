using System;

using Overseer.Models;

namespace Overseer
{
    public interface IMonitoringService : IDisposable
    {
        event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

        void StartMonitoring();
        void StopMonitoring();
    }
}