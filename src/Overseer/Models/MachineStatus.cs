﻿using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Overseer.Models
{
    public enum MachineState
    {
        Offline = 0,
        Idle = 1,
        Paused = 2,
        Operational = 3
    }

    public class TemperatureStatus
    {
        public int HeaterIndex { get; set; }

        public double Actual { get; set; }

        public double Target { get; set; }
    }

    public class MachineStatus
    {
        /// <summary>
        /// The id of the configured machine that this status is for
        /// </summary>
        public int MachineId { get; set; }

        /// <summary>
        /// The current state of the machine
        /// </summary>
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MachineState State { get; set; }

        /// <summary>
        /// The total amount of time the machine has been operational
        /// </summary>
        public int ElapsedJobTime { get; set; }

        /// <summary>
        /// The estimated time remaining for a job
        /// </summary>
        /// <remarks>
        public int EstimatedTimeRemaining { get; set; }

        /// <summary>
        /// The percentage of completion
        /// </summary>
        public double Progress { get; set; }

        /// <summary>
        /// The current speed of the fan
        /// </summary>
        public double FanSpeed { get; set; }

        /// <summary>
        /// The current feed rate of the operation
        /// </summary>
        public double FeedRate { get; set; }

        /// <summary>
        /// The current flow rates for each extruder
        /// </summary>
        public Dictionary<int, double> FlowRates { get; set; } = new Dictionary<int, double>();

        /// <summary>
        /// The current temperatures for each heater
        /// </summary>
        public Dictionary<int, TemperatureStatus> Temperatures { get; set; } = new Dictionary<int, TemperatureStatus>();
    }
}