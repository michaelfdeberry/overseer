using System.Collections.Generic;

namespace Octoprint.Models
{
    public class GcodeAnalysis
    {
        public int EstimatedPrintTime { get; set; }

        public Dictionary<string, Filament> Filament { get; set; }
    }
}