using log4net;
using Overseer.Models;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace Overseer.Machines.Providers
{
	public abstract class MachineProvider<TMachine> : IMachineProvider<TMachine> where TMachine: Machine, new()
    {
        protected static readonly ILog Log = LogManager.GetLogger(typeof(MachineProvider<TMachine>));

        //if there are 5 consecutive errors 
        const int MaxExceptionCount = 5;

        //reduce the update interval to every 2 minutes
        const int ExceptionTimeout = 2;

        readonly Stopwatch _stopwatch = new Stopwatch();

        int _exceptionCount;

		public int MachineId => Machine.Id;

        public TMachine Machine { get; protected set; }

        public virtual Task SetToolTemperature(int heaterIndex, int targetTemperature)
        {
            return ExecuteGcode($"M104 P{heaterIndex} S{targetTemperature}");
        }

        public virtual Task SetBedTemperature(int targetTemperature)
        {
            return ExecuteGcode($"M140 S{targetTemperature}");
        }

        public virtual Task SetFlowRate(int extruderIndex, int percentage)
        {
            return ExecuteGcode($"M221 D{extruderIndex} S{percentage}");
        }

        public virtual Task SetFeedRate(int percentage)
        {
            return ExecuteGcode($"M220 S{percentage}");
        }

        public virtual Task SetFanSpeed(int percentage)
        {
            return ExecuteGcode($"M106 S{(int)(255 * (percentage / 100f))}");
        }

        public virtual Task PauseJob()
        {
            return ExecuteGcode("M25");
        }

        public virtual Task ResumeJob()
        {
            return ExecuteGcode("M24");
        }

        public virtual Task CancelJob()
        {
            return ExecuteGcode("M0");
		}

		public abstract Task ExecuteGcode(string command);

		public abstract Task LoadConfiguration(Machine machine);

		protected abstract Task<MachineStatus> AcquireStatus(CancellationToken cancellationToken);
        
        public async Task<MachineStatus> GetStatus(CancellationToken cancellationToken)
        {
            //if the stopwatch is running and it's in the timeout period just return an offline status
            if (_stopwatch.IsRunning && _stopwatch.Elapsed.TotalMinutes < ExceptionTimeout)
            {
                return new MachineStatus { MachineId = MachineId };
            }

            try
            {
                //if the stopwatch isn't running or if the timeout period is exceeded try to get the status
                var status = await AcquireStatus(cancellationToken);

                //if the status was retrieve successfully reset the exception count and stop the stopwatch
                _exceptionCount = 0;
                _stopwatch.Stop();

                return status;
            }
            catch (Exception ex)
            {
                if (++_exceptionCount >= MaxExceptionCount)
                {
                    //start the timer, or restart the timer in the case it was already running,
                    //this will keep the machine in an offline state and recheck again after the timeout period
                    _stopwatch.Restart();
                    Log.Error("Max consecutive failure count reached, throttling updates", ex);
                }

                return new MachineStatus { MachineId = MachineId };
            }
        }
	}
}
