﻿using System.Collections.Generic;

namespace Overseer.Core.Models
{
    public class PrinterStatus
    {
        //The id of the configured printer that this status is for
        public int PrinterId { get; set; }

        /// <summary>
        /// The current state of the printer
        /// </summary>
        public PrinterState State { get; set; }

        /// <summary>
        /// The current temperatures of the printer
        /// </summary>
        public Dictionary<string, TemperatureStatus> Temperatures { get; set; }

        /// <summary>
        /// The total amount of time the printer has been printing
        /// </summary>
        /// <remarks>
        /// This will only be set if the current state is printing
        /// </remarks>
        public int ElapsedPrintTime { get; set; }

        /// <summary>
        /// The estimated time remaining for a printer
        /// </summary>
        /// <remarks>
        /// This will only be set if the current state is printing
        /// </remarks>
        public int EstimatedTimeRemaining { get; set; }

        /// <summary>
        /// The percentage of completion
        /// </summary>
        /// <remarks>
        /// This will only be set if the current state is printing
        /// </remarks>
        public float Progress { get; set; }

        /// <summary>
        /// The current speed of the fan
        /// </summary>
        public float FanSpeed { get; set; }
    }
}