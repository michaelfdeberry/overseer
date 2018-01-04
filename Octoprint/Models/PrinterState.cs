using System.Collections.Generic;

namespace Octoprint.Models
{
    public class PrinterState
    {
        public Dictionary<string, Temperature> Temperature { get; set; }

        public SdState Sd { get; set; }

        public State State { get; set; }
    }
}