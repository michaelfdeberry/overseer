﻿using System;
using System.Threading.Tasks;

using Overseer.Models;

namespace Overseer.Machines
{
    public interface IMachineProvider
    {
        event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

        int MachineId { get; }

        Task SetToolTemperature(int heaterIndex, int targetTemperature);

        Task SetBedTemperature(int targetTemperature);

        Task SetFlowRate(int extruderIndex, int percentage);

        Task SetFeedRate(int percentage);

        Task SetFanSpeed(int percentage);

        Task PauseJob();

        Task ResumeJob();

        Task CancelJob();

        Task ExecuteGcode(string command);

        Task LoadConfiguration(Machine machine);

        void Start(int interval);

        void Stop();
    }

    public interface IMachineProvider<out TMachine> : IMachineProvider where TMachine : Machine, new()
    {
        TMachine Machine { get; }
    }
}