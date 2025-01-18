using System;
using System.Threading.Tasks;

using log4net;

using Overseer.Models;

namespace Overseer.Machines
{
    public abstract class MachineProvider<TMachine> : IMachineProvider<TMachine> where TMachine : Machine, new()
    {
        protected static readonly ILog Log = LogManager.GetLogger(typeof(MachineProvider<TMachine>));

        public abstract event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

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

        public abstract void Start(int interval);

        public abstract void Stop();
    }
}
