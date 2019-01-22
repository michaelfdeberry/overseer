using System;
using Overseer.Models;

namespace Overseer
{
	public interface IMonitoringService : IDisposable
	{
		bool Enabled { get; }

		event EventHandler<EventArgs<MachineStatus>> StatusUpdate;
		
		void PollProviders();
		void StartMonitoring();
		void StopMonitoring();
	}
}