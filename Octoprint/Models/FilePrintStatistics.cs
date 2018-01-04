namespace Octoprint.Models
{
    public class FilePrintStatistics
    {
        public int Failure { get; set; }

        public int Success { get; set; }

        public LastPrintResults Last { get; set; }
    }
}