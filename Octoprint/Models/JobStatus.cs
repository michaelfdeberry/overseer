using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Octoprint.Models
{
    public class JobInformation
    {
        public float? AveragePrintTime { get; set; }

        public float? EstimatedPrintTime { get; set; }

        public float? LastPrintTime { get; set; }

        public FileInformation File { get; set; }        

        public Filament Filament { get; set; }
    }

    public class ProgressInformation
    {
        public float? Completion { get; set; }

        public int? Filepos { get; set; }

        public int? PrintTime { get; set; }

        public int? PrintTimeLeft { get; set; }
    }
    
    public class JobStatus
    {
        public JobInformation Job { get; set; }

        public ProgressInformation Progress { get; set; }

        public string State { get; set; }
    }
}
